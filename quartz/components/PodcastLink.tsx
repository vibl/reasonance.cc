import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"

interface Options {
  title?: string
  slug?: string
}

const defaultOptions: Options = {
  title: "Podcast",
  slug: "podcast",
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const PodcastLink: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const href = resolveRelative(fileData.slug!, opts.slug!)
    const isActive = fileData.slug === opts.slug

    return (
      <div class="podcast-link">
        <a href={href} class={isActive ? "active" : ""}>
          {opts.title}
        </a>
      </div>
    )
  }

  PodcastLink.css = `
.podcast-link {
  margin-bottom: -1rem;
}
.podcast-link a {
  color: var(--secondary);
  font-weight: 600;
}
.podcast-link a:hover {
  color: var(--tertiary);
}
.podcast-link a.active {
  color: var(--tertiary);
}
`

  return PodcastLink
}) satisfies QuartzComponentConstructor
