import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        fk: {
          blue: "#2874f0",
          blueDark: "#1259c7",
          yellow: "#ff9f00",
          yellowHover: "#f39700",
          orange: "#fb641b",
          orangeHover: "#e6530b",
          green: "#388e3c",
          grayBg: "#f1f3f6",
          textDark: "#212121",
          textMuted: "#878787",
          border: "#e0e0e0",
        },
      },
      fontFamily: {
        sans: ["Roboto", "Helvetica Neue", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
