/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-slide-in": {
          "0%": { opacity: "0", filter: "blur(10px)", transform: "translateY(20px)" },
          "100%": { opacity: "1", filter: "blur(0px)", transform: "translateY(0px)" },
        },
        "slide-right-in": {
          "0%": { opacity: "0", filter: "blur(10px)", transform: "translateX(-40px)" },
          "100%": { opacity: "1", filter: "blur(0px)", transform: "translateX(0px)" },
        },
        "testimonial-in": {
          "0%": { opacity: "0", filter: "blur(10px)", transform: "translateY(20px) scale(0.95)" },
          "100%": { opacity: "1", filter: "blur(0px)", transform: "translateY(0px) scale(1)" },
        },
      },
      animation: {
        "element": "fade-slide-in 0.6s ease-out forwards",
        "slide-right": "slide-right-in 0.8s ease-out forwards",
        "testimonial": "testimonial-in 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
