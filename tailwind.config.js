/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Color Palette from PRD (NFR1.4)
        'softwhite': '#F8F8F8',    // Main Background: Soft White / Off-White
        'sky': {
          100: '#E6F3F4',
          300: '#C9E6E8',
          500: '#A8DADC',          // Secondary Backgrounds/Containers: Sky Blue
          700: '#7BBEC1',
          900: '#4F9FA3',
        },
        'coral': {
          100: '#FADCE1',
          300: '#F6B3BF',
          500: '#EF798A',          // Primary Buttons/Highlights: Playful Coral
          700: '#E64965',
          900: '#D41E42',
        },
        'mint': {
          100: '#E8F7EF',
          300: '#CEF0DF',
          500: '#B0EACD',          // Secondary Accents: Mint Green
          700: '#7DDCAD',
          900: '#4ACE8D',
        },
        'sunny': {
          100: '#FFECBD',
          300: '#FFE08A',
          500: '#FFD166',          // Optional Accent/Feedback: Sunny Yellow
          700: '#FFC133',
          900: '#FFAE00',
        },
        'slate': {
          800: '#2F4F4F',          // Text: Dark Slate Gray
        },
      },
    },
  },
  plugins: [],
}; 