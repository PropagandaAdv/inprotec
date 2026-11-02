/** Design tokens: single source of truth for the INPROTEC brand. No HEX inline in the JSX. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        inprotec: {
          red: '#C0183C',   // primary: CTAs, SVG lines, accents
          red2: '#C6494F',  // hover, second gradient stop
          rose: '#DB9C95',  // micro-labels, soft glows, active borders
          ink: '#0A0B0D',   // canvas (derived from brand black, not an official brand colour)
          ink2: '#121418',  // panels
          text: '#F2F3F5',
          muted: '#9AA0A8',
        },
      },
      fontFamily: {
        chivo: ['Chivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Chivo Mono"', 'Chivo', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
