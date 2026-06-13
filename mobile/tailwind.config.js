/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
    extend: {
        colors:{
            verdeClaro: "#E9FF75",
            verdeEscuro: "#18572C",
        },
    },
    },
    plugins: [],
};