import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"

const AIDisclaimer: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const targetSlug = "How-We-Use-AI"
  return (
    <p class="ai-disclaimer">
      <a href={resolveRelative(fileData.slug!, targetSlug)} class="internal">
        Who wrote this?
      </a>
    </p>
  )
}

AIDisclaimer.css = `
.ai-disclaimer {
  margin: 0.5rem 0 0 0;
  font-style: italic;
}

.ai-disclaimer a {
  font-size: 0.9em;
}
`

export default (() => AIDisclaimer) satisfies QuartzComponentConstructor
