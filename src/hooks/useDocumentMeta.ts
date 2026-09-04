import { useEffect } from 'react'

const SITE_NAME = 'Global Sea Service'
const SITE_URL = 'https://gss-shipping.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(path: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', `${SITE_URL}${path}`)
}

/**
 * Sets the document title + description + Open Graph/Twitter tags for the
 * current route. This is a client-rendered SPA with no server-side
 * rendering, so crawlers that don't execute JS will only ever see the
 * default tags baked into index.html — this hook covers browsers and any
 * crawler that does render JS (Googlebot does).
 */
export function useDocumentMeta(options: { title: string; description: string; path: string; noindex?: boolean }) {
  const { title, description, path, noindex } = options

  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
    document.title = fullTitle

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', `${SITE_URL}${path}`)
    setMeta('property', 'og:image', DEFAULT_OG_IMAGE)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', DEFAULT_OG_IMAGE)
    setCanonical(path)

    let robotsEl = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (noindex) {
      if (!robotsEl) {
        robotsEl = document.createElement('meta')
        robotsEl.setAttribute('name', 'robots')
        document.head.appendChild(robotsEl)
      }
      robotsEl.setAttribute('content', 'noindex, nofollow')
    } else {
      robotsEl?.remove()
    }
  }, [title, description, path, noindex])
}
