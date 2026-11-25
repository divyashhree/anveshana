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
          950: '#070A12',
          900: '#0B0F19',
          850: '#0E1422',
          800: '#131B2E',
          700: '#1E293B',
          600: '#334155',
        },
        gold: {
          50: '#FDFBF0',
          100: '#FAF4D3',
          200: '#F4E7A0',
          300: '#EBD469',
          400: '#E0C03E',
          500: '#D4AF37', // Antique gold
          600: '#B89228',
          700: '#91711D',
          800: '#6C5317',
          900: '#483710',
        },
        copper: {
          400: '#E08E65',
          500: '#C87D55',
          600: '#B85D38',
          700: '#924627',
        },
        ivory: {
          50: '#FCFAF6',
          100: '#F7F3EA',
          200: '#EFE6D5',
          300: '#E3D5BC',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(212, 175, 55, 0.15)',
        'gold-md': '0 0 20px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 0 35px rgba(212, 175, 55, 0.35)',
      }
    },
  },
  plugins: [],
}
