import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  mode: "jit",
  content: {
    files: [
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/container/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
  },

  blocklist: [],
  theme: {
    screens: {
      sssm: "360px",
      ssm: "499px",
      sm: "576px",
      smd: "720px",
      md: "800px",
      lg: "992px",
      xl: "1290px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "0.9375rem",
      },
    },
    colors: {
      "primary-color": "#1A4845",
      "secondary-color": "#47b486",
      "banner-color": "#1A4845",
      "text-color": "#333",
      background: "#F3F3F3",
      "text-light-color": "#999",
      "border-color": "#e5e5e5",
      ...colors,
      lightBlue: colors.sky, // Fix: Rename 'lightBlue' to 'sky'
      warmGray: colors.stone, // Fix: Rename 'warmGray' to 'stone'
      trueGray: colors.neutral, // Fix: Rename 'trueGray' to 'neutral'
      coolGray: colors.gray, // Fix: Rename 'coolGray' to 'gray'
      blueGray: colors.slate, // Fix: Rename 'blueGray' to 'slate'
    },
    extend: {
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      fontSize: {
        ssm: "0.75rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "product-detail": "url('/src/assests/1.jpg')",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["var(--font-open-sans)"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "100%": { opacity: "1" },
          "0%": { opacity: "0" },
        },
        appearFromBottom: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        appearFromTop: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "100%": { transform: "translateY(12px)", opacity: "1" },
        },
        zoomIn: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
        zoomOut: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0)" },
        },
        upDown: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(30px)" },
          "100%": { transform: "translateY(0)" },
          "75%": { transform: "translateY(5px)" },
        },
        shine: {
          "100%": {
            left: "125%",
          },
        },
        appear: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        fadeOut: "fadeOut 0.5s ease-in-out",
        appearFromBottom: "appearFromBottom 0.5s forwards",
        appearFromTop: "appearFromTop 0.5s forwards",
        zoomIn: "zoomIn 1.5s ease-in-out",
        zoomOut: "zoomOut 0.75s ease-in-out",
        upDown: "upDown 30s infinite",
        shine: "shine 0.85s ease",
        appear: "appear 0.5s ease",
      },
      boxShadow: {
        sd: "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
        hd: "0 3px 10px 0 rgba(0,0,0,0.14)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

export default config;
