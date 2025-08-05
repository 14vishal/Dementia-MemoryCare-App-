import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // New color palette
        apricot: {
          DEFAULT: '#ffc9b5',
          100: '#571700',
          200: '#ad2e00', 
          300: '#ff4805',
          400: '#ff875c',
          500: '#ffc9b5',
          600: '#ffd2c2',
          700: '#ffddd1',
          800: '#ffe9e0',
          900: '#fff4f0'
        },
        melon: {
          DEFAULT: '#f7b1ab',
          100: '#4d0d07',
          200: '#991a0e',
          300: '#e62715', 
          400: '#f06b5e',
          500: '#f7b1ab',
          600: '#f9c1bc',
          700: '#fad0cd',
          800: '#fce0dd',
          900: '#fdefee'
        },
        desert_sand: {
          DEFAULT: '#d8aa96',
          100: '#361e14',
          200: '#6b3c28',
          300: '#a15a3b',
          400: '#c57f61',
          500: '#d8aa96',
          600: '#e0b6a5',
          700: '#e8c3b5',
          800: '#f0d0c4',
          900: '#f7ddd4'
        },
        mountbatten_pink: {
          DEFAULT: '#807182',
          100: '#1a161b',
          200: '#342d37',
          300: '#4e4352',
          400: '#67596e',
          500: '#807182',
          600: '#9a8a9c',
          700: '#b4a7b6',
          800: '#cdc4cf',
          900: '#e6e1e7'
        },
        ash_gray: {
          DEFAULT: '#c7d3bf',
          100: '#283022',
          200: '#506044',
          300: '#789066',
          400: '#a0b992',
          500: '#c7d3bf',
          600: '#d2dccc',
          700: '#dde5d8',
          800: '#e9eee5',
          900: '#f4f6f2'
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
