/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/**/*.jsx"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#7985ef",
          DEFAULT: "#5968eb",
        },
        secondary: {
          DEFAULT: "#6B5D3F",
          light: "#F4E0BB",
        },
        surface: {
          low: "#FCF2E5",
          DEFAULT: "#F6EDDF",
          high: "#F1E7D9",
          highest: "#EBE1D4",
        },
        danger: "#77240B",
        success: "#52770B",
      },
      boxShadow: {
        "custom-top": "0 -4px 8px rgba(0, 0, 0, 0.1)", // 위쪽에만 그림자
      },
    },
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "320px",
        md: "600px",
        lg: "600px",
        xl: "600px",
      },
    },
  },
  plugins: [],
};
