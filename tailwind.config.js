/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
        mitr: ['Mitr', 'sans-serif'],
        
        sans: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

