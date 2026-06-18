import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        shell: {
          950: "#06080d",
          900: "#0b1018",
          850: "#101721",
          800: "#151d29",
          700: "#223044"
        }
      },
      boxShadow: {
        node: "0 18px 45px rgba(0, 0, 0, 0.35)",
        glow: "0 0 30px var(--node-glow)"
      }
    }
  },
  plugins: []
} satisfies Config;
