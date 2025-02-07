/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tapas: {
          primary: '#EFB071',
          secondary: '#F9FAFB',
          background: '#476C77',
          card: '#F1E7DD',
          tag: '#082F49',
          footer: '#D1D5DB',
          'footer-text': '#030712',
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#000000',
            h1: {
              color: '#EFB071',
              fontFamily: 'Montserrat',
            },
            h2: {
              color: '#EFB071',
              fontFamily: 'Montserrat',
            },
            h3: {
              color: '#EFB071',
              fontFamily: 'Montserrat',
            },
          },
        },
      },
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        'html': { fontFamily: 'Open Sans, sans-serif' },
        'h1, h2, h3, h4, h5, h6': { fontFamily: 'Montserrat, sans-serif' },
      })
    }
  ],
};
