module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  // ... other config
  theme: {
    extend: {
      animation: {
        "fade-out": "fadeOut 2s ease-in-out",
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  // ... other config
};
