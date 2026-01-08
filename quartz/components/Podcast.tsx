import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/podcast.scss"
import { classNames } from "../util/lang"
import { PodcastEpisode } from "../util/rss"

interface PlatformLink {
  name: string
  url: string
  icon: string
}

interface Options {
  title?: string
  showDescription?: boolean
  platformLinks?: PlatformLink[]
}

const defaultPlatformLinks: PlatformLink[] = [
  {
    name: "RSS Feed",
    url: "https://anchor.fm/s/f3c92f2c/podcast/rss",
    icon: "/static/icons/rss.svg",
  },
  {
    name: "Spotify",
    url: "https://open.spotify.com/show/1NeZKg5tzXbo4eE7Q99Mhf",
    icon: "/static/icons/spotify.svg",
  },
  {
    name: "Apple Podcasts",
    url: "https://podcasts.apple.com/us/podcast/congruences/id1736805018",
    icon: "/static/icons/apple-podcasts.svg",
  },
  {
    name: "Amazon Music",
    url: "https://music.amazon.fr/podcasts/75b758c1-f1af-42a8-b12c-4fba61874027",
    icon: "/static/icons/amazon-music.svg",
  },



]

const defaultOptions: Options = {
  showDescription: true,
  platformLinks: defaultPlatformLinks,
}

function formatDate(date: Date | string, locale: string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function PlatformLinks({ links }: { links: PlatformLink[] }) {
  return (
    <div class="podcast-platforms">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          class="platform-link"
        >
          <img src={link.icon} alt={`${link.name} Logo`} width="28" height="28" />
        </a>
      ))}
    </div>
  )
}

export default ((userOpts?: Partial<Options>) => {
  const Podcast: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }
    const podcastData = fileData.frontmatter?.podcastData as
      | { title: string; description: string; imageUrl: string; episodes: PodcastEpisode[] }
      | undefined

    if (!podcastData) {
      return (
        <div class={classNames(displayClass, "podcast-container")}>
          <p>No podcast episodes found.</p>
        </div>
      )
    }

    const { episodes, description } = podcastData
    const platformLinks = opts.platformLinks ?? []

    return (
      <div class={classNames(displayClass, "podcast-container")}>
        {opts.showDescription && description && (
          <div
            class="podcast-description"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {platformLinks.length > 0 && <PlatformLinks links={platformLinks} />}
        <ul class="episode-list">
          {episodes.map((episode) => (
            <li class="episode-item" key={episode.guid}>
              <div class="episode-artwork">
                <img src={episode.imageUrl} alt={episode.title} loading="lazy" />
              </div>
              <div class="episode-info">
                <h3>{episode.title}</h3>
                <p class="episode-meta">
                  <span class="episode-date">{formatDate(episode.pubDate, cfg.locale)}</span>
                  {episode.duration && <span class="episode-duration">{episode.duration}</span>}
                </p>
                {episode.description && (
                  <div
                    class="episode-description"
                    dangerouslySetInnerHTML={{ __html: episode.description }}
                  />
                )}
                <div class="episode-player">
                  <audio controls preload="metadata">
                    <source src={episode.audioUrl} type="audio/x-m4a" />
                    <source src={episode.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  Podcast.css = style
  return Podcast
}) satisfies QuartzComponentConstructor
