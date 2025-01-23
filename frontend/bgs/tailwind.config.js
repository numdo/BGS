/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/**/*.jsx"
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom-top': '0 -4px 8px rgba(0, 0, 0, 0.1)', // 위쪽에만 그림자
      },
    },
  },
  plugins: [],
}

