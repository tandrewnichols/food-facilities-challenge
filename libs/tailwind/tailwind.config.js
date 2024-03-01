/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        black: '#343a40',

        'primary-dark': '#0A0D1F',
        primary: '#141B41',
        'primary-light': '#26337D',

        'secondary-dark': '#24507F',
        secondary: '#306BAC',
        'secondary-light': '#508DCE',

        'tertiary-dark': '#5D58EE',
        tertiary: '#918EF4',
        'tertiary-light': '#C9C7F9',

        'success-dark': '#2F8968',
        success: '#3EB489',
        'success-light': '#67CBA6',

        'danger-dark': '#EA484E',
        danger: '#EF767A',
        'danger-light': '#F6B6B8',

        'warning-dark': '#CC9900',
        warning: '#FFC107',
        'warning-light': '#FFD147'
      },
      transitionProperty: {
        m: 'margin'
      }
    },
    fontFamily: {
      script: ['"Cormorant Upright"'],
      caps: ['"Cormorant SC"'],
      'fancy-caps': ['"Cormorant Unicase"'],
      sans: [
        'Montserrat',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"'
      ],
      serif: [
        '"Cormorant Garamound"',
        'ui-serif',
        'Georgia',
        'Cambria',
        '"Times New Roman"',
        'Times',
        'serif'
      ],
      mono: [
        '"Ubuntu Mono"',
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace'
      ]
    }
  },
  plugins: [
    require('tailwind-table-padding')
  ],
};

