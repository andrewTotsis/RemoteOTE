import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        bone: "#f6f5f1",
        accent: "#16a34a",
        flag: "#dc2626",
        gray2: "#1f2937",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter"],
      },
    },
  },
  plugins: [],
};
export default config;
