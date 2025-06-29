/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",  // ← Your actual app folder structure
    "./pages/**/*.{js,ts,jsx,tsx}", // optional
    "./components/**/*.{js,ts,jsx,tsx}", // optional
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
