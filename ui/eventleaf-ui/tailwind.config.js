/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2bee3b",
        "background-light": "#f6f8f6",
        "background-dark": "#102212",
        "neutral-leaf": "#4c9a52",
        "soft-green": "#e7f3e8",
        "border-green": "#cfe7d1",
        "border-leaf": "#cfe7d1",
        "text-leaf": "#0d1b0f",
        "subtext-leaf": "#4c9a52",
        "neutral-bg": "#eef7ee",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
