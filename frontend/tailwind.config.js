/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#111111',
          primary: '#111111',
          secondary: '#181818',
          surface: '#1E1E1E',
          elevated: '#242424',
          hover: '#2A2A2A',
        },
        surface: {
          DEFAULT: '#1E1E1E',
          elevated: '#242424',
          hover: '#2A2A2A',
        },
        gold: {
          DEFAULT: '#D4A017',
          primary: '#D4A017',
          secondary: '#C59B27',
          hover: '#E5B22D',
          subtle: 'rgba(212, 160, 23, 0.12)',
          border: 'rgba(212, 160, 23, 0.28)',
          glow: 'rgba(212, 160, 23, 0.20)',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#D4D4D4',
          muted: '#A6A6A6',
          subtle: '#737373',
          accent: '#D4A017',
        },
        border: {
          DEFAULT: '#2B2B2B',
          subtle: '#2B2B2B',
          medium: '#383838',
          gold: 'rgba(212, 160, 23, 0.35)',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Playfair Display', 'serif'],
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      maxWidth: {
        'editorial': '1440px',
        'content': '1280px',
        'prose-narrow': '768px',
      },
      boxShadow: {
        'gold-sm': '0 1px 3px rgba(212, 160, 23, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'gold-md': '0 4px 14px rgba(212, 160, 23, 0.18)',
        'dark-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'dark-modal': '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
