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
          DEFAULT: '#121212',
          secondary: '#1C1C1E',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1A1',
          tertiary: '#B3B3B3',
          inactive: '#E5E5E5',
        },
        accent: {
          DEFAULT: '#FF2D55',
          hover: '#FF1744',
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.04)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.06)',
          active: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Helvetica Neue', 'Helvetica', 'Ubuntu', 'Roboto', 'Noto', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      spacing: {
        'sidebar': '240px',
        'sidebar-max': '300px',
      },
      borderRadius: {
        'card': '10px',
        'nav': '8px',
        'player': '12px',
        'full': '16px',
      },
      backdropBlur: {
        'mini': '8px',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          from: {
            backgroundPosition: '-200px 0'
          },
          to: {
            backgroundPosition: 'calc(200px + 100%) 0'
          }
        }
      }
    },
  },
  plugins: [],
}
