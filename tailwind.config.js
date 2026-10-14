/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          bg: '#080B14',
          sub: '#0D1220',
          surface: '#121A2B',
          card: '#162035',
          border: '#1E293B',
          hover: '#1F2C47',
        },
        cyan: {
          accent: '#67E8F9',
        },
        purple: {
          accent: '#A78BFA',
        },
        amber: {
          accent: '#F4C96B',
        },
        slate: {
          light: '#F1F5F9',
          muted: '#94A3B8',
          subtle: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: 0.3, transform: 'scale(1)' },
          '100%': { opacity: 0.7, transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
