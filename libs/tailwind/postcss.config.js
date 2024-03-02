module.exports = (tailwindConfig) => ({
  plugins: {
    'postcss-import': {
      path: [
        `${ __dirname }/src`
      ]
    },
    'tailwindcss/nesting': {},
    tailwindcss: {
      config: tailwindConfig
    },
    autoprefixer: {},
  },
});
