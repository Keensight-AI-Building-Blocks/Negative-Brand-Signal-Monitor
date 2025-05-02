/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Scans all relevant files in the app directory
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Scans all relevant files in the components directory
    // Add other directories if you have components/pages elsewhere
  ],
  theme: {
    extend: {
      // You can add theme customizations here if needed
    },
  },
  plugins: [],
};
