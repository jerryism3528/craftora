/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#3430a8',
          deep: '#252172',
        },
        violet: {
          DEFAULT: '#7652d4',
        },
        mint: {
          DEFAULT: '#187c6f',
        },
      },
      maxWidth: {
        editorial: '1440px',
      },
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        card: '0 10px 28px rgba(38, 43, 89, .07)',
      },
    },
  },
  plugins: [],
};
