import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { defaultProcessedContent } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { FullSlug, pathToRoot } from "../../util/path"
import { defaultContentPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { Podcast } from "../../components"
import { write } from "./helpers"
import { fetchPodcastFeed } from "../../util/rss"

interface PodcastPageOptions extends Partial<FullPageLayout> {
  rssUrl: string
  slug?: FullSlug
  title?: string
}

const defaultOptions: PodcastPageOptions = {
  rssUrl: "https://anchor.fm/s/f3c92f2c/podcast/rss",
  slug: "podcast" as FullSlug,
}

export const PodcastPage: QuartzEmitterPlugin<Partial<PodcastPageOptions>> = (userOpts) => {
  const options = { ...defaultOptions, ...userOpts }
  const slug = options.slug!

  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultContentPageLayout,
    pageBody: Podcast({ title: options.title }),
    ...userOpts,
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "PodcastPage",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const cfg = ctx.cfg.configuration
      const allFiles = content.map((c) => c[1].data)

      // Fetch podcast RSS feed at build time
      let podcastData
      try {
        podcastData = await fetchPodcastFeed(options.rssUrl)
      } catch (error) {
        console.error(`[PodcastPage] Failed to fetch RSS feed: ${error}`)
        podcastData = {
          title: "Podcast",
          description: "",
          imageUrl: "",
          episodes: [],
        }
      }

      // Create synthetic content for the podcast page
      const [tree, vfile] = defaultProcessedContent({
        slug,
        text: podcastData.description,
        description: podcastData.description,
        frontmatter: {
          title: "Reasonance podcast",
          tags: [],
          podcastData,
        },
      })

      const externalResources = pageResources(pathToRoot(slug), resources)
      const componentData: QuartzComponentProps = {
        ctx,
        fileData: vfile.data,
        externalResources,
        cfg,
        children: [],
        tree,
        allFiles,
      }

      const pageContent = renderPage(cfg, slug, componentData, opts, externalResources)
      yield write({
        ctx,
        content: pageContent,
        slug,
        ext: ".html",
      })
    },
  }
}
