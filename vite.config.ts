import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Inlines the single build-time stylesheet directly into index.html so the
// critical rendering path is html -> paint instead of html -> css(RTT) -> paint.
// Safe here because the whole app ships one small (~10KB gzip) global
// stylesheet with no per-route splitting to lose.
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html
        let inlined = html
        for (const [fileName, asset] of Object.entries(bundle)) {
          if (asset.type === 'asset' && fileName.endsWith('.css')) {
            // font-display: optional -> first paint never waits on a webfont
            // round-trip; it only shows once already cached. Fine for a
            // marketing site's typography, valuable for first-visit FCP/LCP.
            const css = asset.source.toString().replace(/font-display:\s*swap/g, 'font-display: optional')
            const linkRe = new RegExp(`<link[^>]*href="[^"]*${fileName}"[^>]*>`)
            inlined = inlined.replace(linkRe, `<style>${css}</style>`)
          }
        }
        return inlined
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), inlineCss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap', '@gsap/react'],
        },
      },
    },
  },
})
