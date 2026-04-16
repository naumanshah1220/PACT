import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pact: {
          bg: '#eae8e1',
          card: '#ffffff',
          border: '#d8d4cc',
          pledge: '#3B6D11',
          betray: '#993C1D',
          muted: '#f0ede6',
          subtle: '#f2f0eb',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        // Medieval accent fonts
        cinzel: ['Cinzel Decorative', 'serif'],     // wordmark + drop caps only
        fell: ['IM Fell English', 'Georgia', 'serif'], // page H1 headings
      },
      animation: {
        'scroll-up': 'scroll-up 30s linear infinite',
        'fade-up': 'fade-up 350ms ease forwards',
        'slide-in-left': 'slide-in-left 400ms ease forwards',
      },
      keyframes: {
        'scroll-up': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      }
    },
  },
  plugins: [],
}

export default config
