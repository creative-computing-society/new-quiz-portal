/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xxsm': '390px',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

