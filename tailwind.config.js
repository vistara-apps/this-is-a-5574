/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(220 80% 50%)',
        accent: 'hsl(180 70% 45%)',
        background: 'hsl(220 20% 98%)',
        surface: 'hsl(0 0% 100%)',
        text: 'hsl(220 15% 20%)',
        'text-secondary': 'hsl(220 15% 40%)',
        border: 'hsl(220 15% 90%)',
        purple: {
          50: '#f8f7ff',
          100: '#f0edff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0 8px 24px hsla(220, 15%, 10%, 0.12)',
        'modal': '0 30px 60px hsla(220, 15%, 10%, 0.20)',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '24px',
        'xxl': '32px',
      }
    },
  },
  plugins: [],
}