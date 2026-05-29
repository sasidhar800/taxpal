export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#06b6d4",
        secondary: "#1e293b",
        dark: "#0f172a",
        card: "#111827",
        surface: {
          light: "#f8fafc",
          dark: "#0b0e14",
        },
      },

      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },

      boxShadow: {
        glow: "0 0 20px rgba(6, 182, 212, 0.35)",
        card: "0 10px 30px rgba(0, 0, 0, 0.25)",
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
      },

      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },

      backdropBlur: {
        xs: "2px",
      },

      animation: {
        float: "float 3s ease-in-out infinite",
        fade: "fade 0.5s ease-in-out",
        pulseSlow: "pulse 3s infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-6px)",
          },
        },
        fade: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },

      backgroundImage: {
        dashboardGradient:
          "linear-gradient(to bottom right, #0f172a, #111827, #1e293b)",
      },
    },
  },

  plugins: [],
};
