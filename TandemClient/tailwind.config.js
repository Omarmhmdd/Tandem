/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#53389E',
          secondary: '#9E77ED',
          light: '#D6BBFB',
        },
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(158, 119, 237, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}