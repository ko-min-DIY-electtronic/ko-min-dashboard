/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Graphik", "sans-serif"],
        serif: ["Merriweather", "serif"],
        squada: ['"Squada One"', "sans-serif"],
      },
      colors: {
        primary: "#1E1E1E", // Custom primary color
        success: "#CFF7D3", // Custom secondary color
        successText: "#02542D",
        warning: "#FFF1C2",
        warningText: "#401B01",
        danger: "#FDD3D0",
        dangerText: "#900B09",
        info: "#900B09",
        infoText: "#000080",
        // Add more custom colors as needed
      },
    },
  },
  plugins: [],
};

// module.exports = {
//   theme: {
//     screens: {
//       sm: '480px',
//       md: '768px',
//       lg: '976px',
//       xl: '1440px',
//     },
//     colors: {
//       'blue': '#1fb6ff',
//       'purple': '#7e5bef',
//       'pink': '#ff49db',
//       'orange': '#ff7849',
//       'green': '#13ce66',
//       'yellow': '#ffc82c',
//       'gray-dark': '#273444',
//       'gray': '#8492a6',
//       'gray-light': '#d3dce6',
//     },
//     fontFamily: {
//       sans: ['Graphik', 'sans-serif'],
//       serif: ['Merriweather', 'serif'],
//     },
//     extend: {
//       spacing: {
//         '128': '32rem',
//         '144': '36rem',
//       },
//       borderRadius: {
//         '4xl': '2rem',
//       }
//     }
//   }
// }
