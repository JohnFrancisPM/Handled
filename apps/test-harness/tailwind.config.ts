import type { Config } from "tailwindcss";

// Token → theme mapping per design-system-setup.md §2. Every value resolves to a CSS
// variable defined in styles/tokens.css — no hex here. Identical wiring to the other apps.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        grey: {
          900: "var(--color-grey-900)", 800: "var(--color-grey-800)", 700: "var(--color-grey-700)",
          600: "var(--color-grey-600)", 500: "var(--color-grey-500)", 400: "var(--color-grey-400)",
          300: "var(--color-grey-300)", 200: "var(--color-grey-200)", 100: "var(--color-grey-100)",
          50: "var(--color-grey-50)", 25: "var(--color-grey-25)"
        },
        brand: {
          DEFAULT: "var(--color-blue-500)",
          900: "var(--color-blue-900)", 800: "var(--color-blue-800)", 700: "var(--color-blue-700)",
          600: "var(--color-blue-600)", 500: "var(--color-blue-500)", 400: "var(--color-blue-400)",
          300: "var(--color-blue-300)", 200: "var(--color-blue-200)", 100: "var(--color-blue-100)",
          50: "var(--color-blue-50)"
        },
        blue: {
          900: "var(--color-blue-900)", 800: "var(--color-blue-800)", 700: "var(--color-blue-700)",
          600: "var(--color-blue-600)", 500: "var(--color-blue-500)", 400: "var(--color-blue-400)",
          300: "var(--color-blue-300)", 200: "var(--color-blue-200)", 100: "var(--color-blue-100)",
          50: "var(--color-blue-50)"
        },
        green: { 900:"var(--color-green-900)",800:"var(--color-green-800)",700:"var(--color-green-700)",600:"var(--color-green-600)",500:"var(--color-green-500)",400:"var(--color-green-400)",300:"var(--color-green-300)",200:"var(--color-green-200)",100:"var(--color-green-100)",50:"var(--color-green-50)" },
        red: { 900:"var(--color-red-900)",800:"var(--color-red-800)",700:"var(--color-red-700)",600:"var(--color-red-600)",500:"var(--color-red-500)",400:"var(--color-red-400)",300:"var(--color-red-300)",200:"var(--color-red-200)",100:"var(--color-red-100)",50:"var(--color-red-50)" },
        yellow: { 900:"var(--color-yellow-900)",800:"var(--color-yellow-800)",700:"var(--color-yellow-700)",600:"var(--color-yellow-600)",500:"var(--color-yellow-500)",400:"var(--color-yellow-400)",300:"var(--color-yellow-300)",200:"var(--color-yellow-200)",100:"var(--color-yellow-100)",50:"var(--color-yellow-50)" },
        violet: { 900:"var(--color-violet-900)",800:"var(--color-violet-800)",700:"var(--color-violet-700)",600:"var(--color-violet-600)",500:"var(--color-violet-500)",400:"var(--color-violet-400)",300:"var(--color-violet-300)",200:"var(--color-violet-200)",100:"var(--color-violet-100)",50:"var(--color-violet-50)" },
        orange: { 900:"var(--color-orange-900)",800:"var(--color-orange-800)",700:"var(--color-orange-700)",600:"var(--color-orange-600)",500:"var(--color-orange-500)",400:"var(--color-orange-400)",300:"var(--color-orange-300)",200:"var(--color-orange-200)",100:"var(--color-orange-100)",50:"var(--color-orange-50)" },
        // semantic aliases
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "bg-surface": "var(--bg-surface)",
        "bg-subtle": "var(--bg-subtle)",
        "border-default": "var(--border-default)"
      },
      spacing: {
        "1":"var(--space-1)","2":"var(--space-2)","3":"var(--space-3)","4":"var(--space-4)",
        "6":"var(--space-6)","8":"var(--space-8)","10":"var(--space-10)","12":"var(--space-12)",
        "16":"var(--space-16)","24":"var(--space-24)","28":"var(--space-28)"
      },
      borderRadius: {
        sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", xl: "var(--radius-xl)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      transitionTimingFunction: {
        "ds-out": "var(--ease-out)", "ds-in": "var(--ease-in)", "ds-in-out": "var(--ease-in-out)"
      }
    }
  },
  plugins: []
};

export default config;
