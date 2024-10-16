/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      akaya: ['"Akaya Kanadaka"', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        blue: "hsla(217, 91%, 60%, 1)",
        "blue-1": "hsla(226, 76%, 80%, 1)",
        "blue-2": "hsla(224, 76%, 48%, 1)",
        green: "#ffcfcf",
        background: "#ffd0d0",
        "dark-blue": "hsla(215, 25%, 27%, 1)",
        "text-standard": "hsla(227, 13%, 14%, 1)",
        "text-low-contrast": "hsla(0, 0%, 63%, 1)",
        "primary-brand": "#ffcfcf",
        "secondary-brand": "#ffcfcf",
        outlines: "#ffffff",
        accent: "#ffffff",
      },
    },
    animation: {
      blink: "blink-keyframe 1s ease-in-out infinite",
    },
    keyframes: {
      "blink-keyframe": {
        "0%": { visibility: "visible" },
        "50%": { visibility: "hidden" },
      },
    },
  },
  plugins: [],
};
