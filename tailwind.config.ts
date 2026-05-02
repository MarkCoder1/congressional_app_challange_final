import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(0 0% 89.8%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(0 0% 3.6%)",
        card: "hsl(0 0% 100%)",
        "card-foreground": "hsl(0 0% 3.6%)",
        primary: "hsl(0 0% 9%)",
        "primary-foreground": "hsl(0 0% 100%)",
        secondary: "hsl(0 0% 96.1%)",
        "secondary-foreground": "hsl(0 0% 9%)",
        muted: "hsl(0 0% 96.1%)",
        "muted-foreground": "hsl(0 0% 45.1%)",
        accent: "hsl(217.2 91.2% 59.8%)",
        "accent-foreground": "hsl(210 40% 96%)",
        destructive: "hsl(0 84.2% 60.2%)",
        "destructive-foreground": "hsl(210 40% 96%)",
      },
    },
  },
  plugins: [],
};

export default config;
