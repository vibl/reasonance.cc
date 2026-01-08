import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link} target="_blank" class="cc-license">
                <svg
                  class="cc-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 120 120"
                  aria-label="Creative Commons"
                >
                  <circle cx="60" cy="60" r="48" fill="currentColor" />
                  <path
                    fill="var(--light)"
                    d="m60 6c15.1 0 27.9 5.3 38.5 15.8 5.1 5.1 8.9 10.9 11.6 17.4 2.6 6.5 3.9 13.4 3.9 20.8 0 7.4-1.3 14.3-3.9 20.8-2.6 6.5-6.4 12.2-11.5 17.1-5.3 5.2-11.2 9.2-17.9 12-6.7 2.8-13.6 4.1-20.7 4.1s-14-1.4-20.5-4.1c-6.5-2.7-12.3-6.7-17.4-11.9-5.2-5.2-9.1-11-11.8-17.5-2.7-6.5-4-13.3-4-20.5 0-7.1 1.4-14 4.1-20.6 2.7-6.6 6.7-12.5 11.9-17.7C32.5 11.3 44.5 6 60 6zm.2 9.7c-12.3 0-22.7 4.3-31.1 12.9-4.2 4.3-7.5 9.1-9.8 14.5-2.3 5.4-3.4 11-3.4 16.8 0 5.8 1.1 11.4 3.4 16.7 2.3 5.4 5.5 10.2 9.8 14.4 4.2 4.2 9 7.4 14.4 9.6 5.3 2.2 10.9 3.3 16.8 3.3 5.8 0 11.4-1.1 16.8-3.4 5.4-2.3 10.3-5.5 14.7-9.7 8.4-8.2 12.6-18.5 12.6-30.9 0-6-1.1-11.6-3.3-17-2.2-5.3-5.4-10.1-9.6-14.3-8.7-8.7-18.9-12.9-31.3-12.9zm-.7 35.3-7.2 3.8c-.8-1.6-1.7-2.7-2.8-3.4-.6-.4-1.4-.6-2.4-.6-.7 0-1.4.1-2.1.4-.7.3-1.2.7-1.7 1.2-.9 1-1.4 2.7-1.4 5.1 0 2.9.6 5.2 1.8 6.9 1.2 1.7 3 2.6 5.4 2.6 3.1 0 5.4-1.5 6.6-4.6l6.6 3.4c-1.4 2.6-3.4 4.7-5.9 6.2-2.5 1.5-5.3 2.3-8.3 2.3-4.8 0-8.7-1.5-11.7-4.4-2.9-3-4.4-7.1-4.4-12.3 0-5.1 1.5-9.2 4.5-12.2 3-3 6.8-4.5 11.3-4.5 6.7 0 11.5 2.6 14.4 7.8zm31.1 0-7.1 3.8c-.8-1.6-1.7-2.7-2.8-3.4-.6-.4-1.4-.6-2.4-.6-.7 0-1.4.1-2.1.4-.7.3-1.3.7-1.7 1.2-.9 1-1.4 2.7-1.4 5.1 0 2.9.6 5.2 1.8 6.9 1.2 1.7 3 2.6 5.4 2.6 3.1 0 5.4-1.5 6.6-4.6l6.7 3.4c-1.5 2.6-3.5 4.7-6 6.2-2.5 1.5-5.2 2.3-8.2 2.3-4.9 0-8.8-1.5-11.7-4.4-2.9-3-4.4-7.1-4.4-12.3 0-5.1 1.5-9.2 4.5-12.2 3-3 6.8-4.5 11.3-4.5 6.7 0 11.4 2.6 14.3 7.8z"
                  />
                </svg>
                {text}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
