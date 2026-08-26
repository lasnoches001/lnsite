/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lasnoches: {
          bg: '#0F1111', // Very dark grey, slightly desaturated
          surface: '#1A1C1C',
          surfaceHighlight: '#2A2D2D',
          border: '#3A3F3F',
          text: '#F2F2F2', // Sand-like white
          textDim: '#A8ACAC',
          accent: '#00FF41', // Ulquiorra Segunda Etapa green
          cero: '#00FF41',
          blood: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        display: ['Anton', 'sans-serif'],
        oswald: ['Montserrat', 'sans-serif'], // Fallback
      }
    },
  },
  plugins: [],
}
