import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ConditionalRender({
      component: Component.AIDisclaimer(),
      condition: (page) => {
        const slug = page.fileData.slug ?? ""
        return slug.startsWith("essays/") && slug !== "essays/index"
      },
    }),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.PodcastLink(),
    Component.Explorer({
      title: "bla",
      useSavedState: false,
      mapFn: (node) => {
        if (node.isFolder && node.data?.filePath) {
          const folderPath = node.data.filePath.substring(0, node.data.filePath.lastIndexOf("/"))
          node.displayName = folderPath.split("/").pop() || node.slugSegment
        } else if (!node.isFolder) {
          node.displayName = node.data?.filePath?.split("/").pop()?.replace(/\.[^/.]+$/, "") || node.slugSegment
        }
      },
    }),
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ConditionalRender({
      component: Component.AIDisclaimer(),
      condition: (page) => page.fileData.slug !== "essays/index",
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.PodcastLink(),
    Component.Explorer({
      mapFn: (node) => {
        if (node.isFolder && node.data?.filePath) {
          const folderPath = node.data.filePath.substring(0, node.data.filePath.lastIndexOf("/"))
          node.displayName = folderPath.split("/").pop() || node.slugSegment
        } else if (!node.isFolder) {
          node.displayName = node.data?.filePath?.split("/").pop()?.replace(/\.[^/.]+$/, "") || node.slugSegment
        }
      },
    }),
  ],
  right: [],
}
