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
          bg: '#e6dfd0',
          card: '#f0ead8',
          border: '#cec4ae',
          pledge: '#3B6D11',
          betray: '#993C1D',
          muted: '#e0d8c8',
          subtle: '#ede7d6',
          ink: '#1a1208',
        }
      },
      fontFamily: {
        // System contrast labels — keep DM Mono
        mono: ['DM Mono', 'monospace'],
        // UI elements that need to stay clean
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        // Legacy serif (gold amounts, large numbers)
        serif: ['Playfair Display', 'Georgia', 'serif'],
        // Primary: IM Fell English for all body + headings
        fell: ['IM Fell English', 'Georgia', 'serif'],
      },
      animation: {
        'scroll-up': 'scroll-up 40s linear infinite',
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
