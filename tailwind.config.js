/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ooca: {
          DEFAULT: '#00BAA4',
          hover: '#008575',
          mint: '#DEF5F3',
          orange: '#F5A623',
          blue: '#2F7FED',
          slate: '#264648',
          muted: '#7C9E9F',
        },
      },
      fontFamily: {
        sans: ['Prompt', 'Gotham Rounded', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ooca-gradient': 'linear-gradient(to bottom, #DEF5F3 0%, #FFFFFF 100%)',
      },
      boxShadow: {
        card: '0 8px 24px 0 rgba(0,186,164,0.12)',
        pill: '0 4px 12px 0 rgba(0,186,164,0.25)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: { marquee: 'marquee 40s linear infinite' },
    },
  },
  plugins: [],
};
