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
          bg:     '#EEEDE4',
          card:   '#F5F3EA',
          border: '#D4CCBA',
          pledge: '#3B6D11',
          betray: '#993C1D',
          muted:  '#E6E3D8',
          ink:    '#1a1208',
          gold:   '#b07d2a',
        }
      },
      fontFamily: {
        mono:  ['DM Mono', 'monospace'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        fell:  ['IM Fell English', 'Georgia', 'serif'],
      },
      animation: {
        'scroll-up':    'scroll-up 40s linear infinite',
        'fade-up':      'fade-up 350ms ease forwards',
        'slide-in-left':'slide-in-left 400ms ease forwards',
        'shimmer':      'shimmer 5s linear infinite',
      },
      keyframes: {
        'scroll-up':     { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-50%)' } },
        'fade-up':       { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-left': { '0%': { opacity: '0', transform: 'translateX(-24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'shimmer':       { '0%': { backgroundPosition: '200% center' }, '100%': { backgroundPosition: '-200% center' } },
      }
    },
  },
  plugins: [],
}

export default config
