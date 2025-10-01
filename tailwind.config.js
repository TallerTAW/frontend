/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f9fe1',
        secondary: '#9eca3f',
        accent: '#fbab22',
        highlight: '#f87326',
        light: '#fefefe',
      },
      fontFamily: {
        'title': ['Montserrat', 'sans-serif'],
        'body': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
