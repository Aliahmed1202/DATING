/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        peach: {
          50: '#FFF5F0',
          100: '#FFE8DB',
          200: '#FFD4B8',
          300: '#FFB995',
          400: '#F8B195',
          500: '#F67280',
          600: '#E55A6D',
          700: '#C06C84',
          800: '#9D5A6E',
          900: '#7A4A5A',
        },
        coral: {
          50: '#FFF0F0',
          100: '#FFE0E0',
          200: '#FFC0C0',
          300: '#FFA0A0',
          400: '#F67280',
          500: '#E55A6D',
          600: '#D04A5D',
          700: '#B03A4D',
          800: '#902A3D',
          900: '#701A2D',
        },
        rose: {
          50: '#FFF0F5',
          100: '#FFE0EB',
          200: '#FFC0D7',
          300: '#FFA0C3',
          400: '#C06C84',
          500: '#A05A6C',
          600: '#904A5C',
          700: '#703A4C',
          800: '#502A3C',
          900: '#301A2C',
        },
        purple: {
          50: '#F5F0FF',
          100: '#EBE0FF',
          200: '#D7C0FF',
          300: '#C3A0FF',
          400: '#6C5B7B',
          500: '#5A4A6C',
          600: '#4A3A5C',
          700: '#3A2A4C',
          800: '#2A1A3C',
          900: '#1A0A2C',
        },
        background: {
          primary: '#FFF8F5',
          secondary: '#FAF7F5',
        },
        border: {
          soft: '#F1D8D8',
        },
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(192, 108, 132, 0.1)',
        'soft-lg': '0 8px 30px rgba(192, 108, 132, 0.15)',
        'glass': '0 8px 32px rgba(192, 108, 132, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
