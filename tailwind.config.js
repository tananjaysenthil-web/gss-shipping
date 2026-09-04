/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF7F0', // main background
        peach2: '#FFE5D2', // secondary background
        peach: '#FFB38A', // primary accent (pair with ink text, never white)
        coral: '#FF8F70', // strong accent (pair with ink text, never white)
        'coral-deep': '#F2754F', // hover state for coral fills
        rose: '#D98C8C', // secondary accent — decorative/border only, not text
        yellow: '#FFF0C9', // highlight background
        ink: '#3D2B28', // main text + dark-surface background
        'ink-deep': '#2C1F1C', // hover state for ink surfaces
        muted: '#806B65', // secondary text (14px+ only — 4.7:1 on cream)
        card: '#FFFCF8',
        border: '#F2D5C5',
      },
      fontFamily: {
        heading: ['"Oswald"', '"Arial Narrow"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wide2: '0.08em',
      },
    },
  },
  plugins: [],
}
