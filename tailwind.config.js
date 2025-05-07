import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.5s',
        'pulse-fast': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s',
        'glow': 'glow 5s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { transform: 'scale(0.9)', opacity: 0.6 },
          '100%': { transform: 'scale(1.1)', opacity: 1 },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}


