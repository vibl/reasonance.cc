# Claude Code Instructions

## Project Overview
This is **Reasonance**, a Quartz v4 static site generator project. Quartz transforms Markdown files into a fully-featured website with search, bidirectional links, and graph visualization.

## Tech Stack
- **Framework**: Quartz v4 (static site generator)
- **UI Library**: Preact 10.x (not React)
- **Package Manager**: pnpm
- **Build**: esbuild
- **Styling**: SCSS
- **Content**: Markdown with Obsidian-flavored syntax

## Key Commands
```bash
pnpm quartz build          # Build the site
pnpm quartz build --serve  # Build and serve locally at http://localhost:8080
pnpm quartz sync           # Sync content
```

## Project Structure
```
quartz/
  components/           # Preact components (QuartzComponent pattern)
    styles/            # SCSS styles for components
  plugins/
    transformers/      # Markdown processing plugins
    emitters/          # Page generation plugins
    filters/           # Content filtering plugins
  util/                # Utility functions
  styles/              # Global styles and variables
content/               # Markdown content files
quartz.config.ts       # Main configuration
quartz.layout.ts       # Page layout definitions
```

## Component Pattern
Components follow the `QuartzComponentConstructor` pattern:
```typescript
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/myComponent.scss"

export default ((opts?: Options) => {
  const MyComponent: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
    return <div>...</div>
  }
  MyComponent.css = style
  return MyComponent
}) satisfies QuartzComponentConstructor
```

## Emitter Plugin Pattern
Emitters generate HTML pages at build time. See `quartz/plugins/emitters/folderPage.tsx` for reference.

## Static Assets
- **`quartz/static/`** - For icons, fonts, and images that need a stable URL (favicons, banners, site icons). Handled by the `Static` plugin.
- **`content/`** - For assets directly referenced by markdown content (images, videos, audio). Handled by the `Assets` plugin.

Example: Place favicon at `quartz/static/icon.png` → accessible at `/static/icon.png`

## Important Notes
- Uses Preact directly, NOT React or preact/compat
- JSX config: `jsxImportSource: "preact"` with `jsx: "react-jsx"`
- Components use `class` not `className` for CSS classes
- Styles use SCSS with variables from `quartz/styles/variables.scss`

## Documentation Lookup
Use Context7 MCP to look up Quartz documentation:`/jackyzha0/quartz`
