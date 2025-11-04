/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bark: {
          50: '#f8efe6',
          100: '#f1dcc9',
          200: '#e3b89d',
          300: '#d3926f',
          400: '#c3724a',
          500: '#a65233',
          600: '#85402a',
          700: '#643021',
          800: '#4c2419',
          900: '#331811',
          950: '#1e0d09',
        },
        amberglass: '#f7a046',
      },
      fontFamily: {
        sans: ['"Poppins"', '"Segoe UI"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 20px 45px rgba(30, 27, 22, 0.2)',
        soft: '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5b2a16 0%, #401c11 45%, #2c150d 100%)',
        'amber-gradient': 'linear-gradient(135deg, #ffa94d 0%, #ff8618 100%)',
        'sand-gradient': 'linear-gradient(135deg, #fff4e6 0%, #ffe4c7 100%)',
      },
      maxWidth: {
        'site': '1100px',
      },
    },
  },
  plugins: [],
};
