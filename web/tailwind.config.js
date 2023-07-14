const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      'akash-red': '#FA5757', // same as red-1
      'red-1': '#FA5757',
      'red-2': '#FF7981',
      'red-3': '#FFBEC1',
      'yellow-1': '#F3F81F',
      'yellow-2': '#F5F863',
      'yellow-3': '#FCFDCC',
      'purple-1': '#B65FCD',
      'purple-2': '#C088CF',
      'purple-3': '#C088CF',
      black: '#000000',
      'grey-90': '#232323',
      'grey-70': '#666666',
      'grey-50': '#B8B8B8',
      'grey-25': '#D7D7D7',
      'grey-10': '#F1F1F1',
      white: '#FFFFFF',
    },
    fontFamily: {
      satoshi: ['Satoshi-Variable', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
};
