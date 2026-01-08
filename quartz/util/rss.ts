export interface PodcastEpisode {
  title: string
  description: string
  pubDate: Date
  duration: string
  audioUrl: string
  imageUrl: string
  guid: string
}

export interface PodcastFeed {
  title: string
  description: string
  imageUrl: string
  episodes: PodcastEpisode[]
}

function getTextContent(element: Element | null, tagName: string): string {
  const el = element?.getElementsByTagName(tagName)[0]
  return el?.textContent?.trim() ?? ""
}

function getItunesContent(element: Element | null, tagName: string): string {
  // Handle iTunes namespaced elements like itunes:duration, itunes:image
  const el = element?.getElementsByTagNameNS("*", tagName)[0]
  return el?.textContent?.trim() ?? el?.getAttribute("href") ?? ""
}

export async function fetchPodcastFeed(rssUrl: string): Promise<PodcastFeed> {
  const response = await fetch(rssUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`)
  }

  const xmlText = await response.text()
  const { JSDOM } = await import("jsdom")
  const dom = new JSDOM(xmlText, { contentType: "text/xml" })
  const doc = dom.window.document

  const channel = doc.querySelector("channel")
  if (!channel) {
    throw new Error("Invalid RSS feed: no channel element found")
  }

  // Parse podcast metadata
  const feedTitle = getTextContent(channel, "title")
  const feedDescription = getTextContent(channel, "description")
  const feedImage =
    channel.querySelector("image > url")?.textContent?.trim() ??
    getItunesContent(channel, "image") ??
    ""

  // Parse episodes
  const items = channel.querySelectorAll("item")
  const episodes: PodcastEpisode[] = []

  for (const item of items) {
    const enclosure = item.querySelector("enclosure")
    const audioUrl = enclosure?.getAttribute("url") ?? ""

    // Get iTunes image or fall back to feed image
    const itunesImage = item.getElementsByTagNameNS("*", "image")[0]
    const episodeImage = itunesImage?.getAttribute("href") ?? feedImage

    episodes.push({
      title: getTextContent(item, "title"),
      description: getTextContent(item, "description"),
      pubDate: new Date(getTextContent(item, "pubDate")),
      duration: getItunesContent(item, "duration"),
      audioUrl,
      imageUrl: episodeImage,
      guid: getTextContent(item, "guid"),
    })
  }

  return {
    title: feedTitle,
    description: feedDescription,
    imageUrl: feedImage,
    episodes,
  }
}
