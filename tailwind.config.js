/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
    "./store/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        void: "#050914",
        orbit: "#0a1628",
        panel: "rgba(13, 26, 47, 0.72)",
        cyan: {
          signal: "#5ee7ff",
          bright: "#87f6ff"
        },
        aurora: "#37f8a2",
        warning: "#ffcc66",
        critical: "#ff4d6d",
        telemetry: "#f8fbff"
      },
      boxShadow: {
        glow: "0 0 26px rgba(94, 231, 255, 0.22)",
        danger: "0 0 26px rgba(255, 77, 109, 0.22)"
      },
      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
        mono: ["IBM Plex Mono", "Consolas", "monospace"]
      },
      backgroundImage: {
        "scan-grid":
          "linear-gradient(rgba(94,231,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(94,231,255,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
