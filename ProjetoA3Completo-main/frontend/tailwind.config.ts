import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-1": "linear-gradient(-154deg, #C37778 0%, #93367C 100%)",
      },
    },
  },
  plugins: [],
}
export default config
