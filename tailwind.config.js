/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Add your paths here
    './src/app/**/*.{js,jsx,ts,tsx,mdx}',
    './src/components/**/*.{js,jsx,ts,tsx,mdx}',
    // You can also add other directories as needed
  ],
  theme: {
    extend: {
      // Add or override Tailwind theme configs here
      colors: {
        primary: '#6f4cff', // Example brand color
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
