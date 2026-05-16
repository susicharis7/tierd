import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        /** UI display font (buttons/labels/headings). */
        display: ['"Space Grotesk"', "sans-serif"],
        /** Hero/page titles only. */
        title: ['"GoodTime Grotesk"', '"Space Grotesk"', "sans-serif"],
        body: ["Inter", "sans-serif"],
        /** Studio Notebook (Tierd. redesign) — chunky display, headlines only. */
        boldonse: ["Boldonse", '"Bricolage Grotesque"', "system-ui", "sans-serif"],
        /** Studio Notebook — UI/body for the redesign. */
        grot: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        /** Studio Notebook — code, captions, metadata, `// section labels`. */
        "mono-jb": ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glass: {
          DEFAULT: "hsl(var(--glass))",
          border: "hsl(var(--glass-border))",
        },
        ember: "hsl(var(--ember))",
        "ember-glow": "hsl(var(--ember-glow))",
        amber: "hsl(var(--amber))",

        /* --- Studio Notebook palette (Tierd. redesign) ---------------
         * Brand-fixed; not theme-swappable. Nested palettes (DEFAULT + variants)
         * so `bg-ink`, `bg-ink-2`, `text-cream`, `text-cream-3` etc all work.
         */
        ink: {
          DEFAULT: "hsl(var(--ink))",
          2: "hsl(var(--ink-2))",
          3: "hsl(var(--ink-3))",
          line: "hsl(var(--ink-line))",
        },
        cream: {
          DEFAULT: "hsl(var(--cream))",
          2: "hsl(var(--cream-2))",
          3: "hsl(var(--cream-3))",
        },
        orange: {
          DEFAULT: "hsl(var(--orange))",
          2: "hsl(var(--orange-2))",
          soft: "hsl(var(--orange-soft))",
        },
        peach: "hsl(var(--peach))",
        forest: "hsl(var(--forest))",
        sage: "hsl(var(--sage))",
        tape: "hsl(var(--tape))",
        plum: "hsl(var(--plum))",
        "muted-ink": "hsl(var(--muted-ink))",
        "muted-cream": "hsl(var(--muted-cream))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        /** Studio Notebook — composer placeholder cursor. */
        "blink": {
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marquee": "marquee 30s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "blink": "blink 1s steps(1) infinite",
      },
      boxShadow: {
        /** Studio Notebook — signature 3-layer shadow on every sticker. */
        sticker:
          "0 1px 0 rgba(0,0,0,0.05) inset, 0 8px 24px rgba(0,0,0,0.25), 0 2px 0 rgba(0,0,0,0.15)",
        /** Primary CTA — pressed-down feel + orange glow. */
        "cta-orange":
          "0 4px 0 rgba(0,0,0,0.25), 0 12px 28px rgba(255,90,31,0.4)",
        /** Secondary "pressed" button. */
        press: "0 3px 0 rgba(0,0,0,0.2)",
        /** Hero tier card glow. */
        "glow-orange": "0 16px 40px rgba(255,90,31,0.35)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
