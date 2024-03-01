const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const baseConfig = require('../../libs/tailwind/tailwind.config');
const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  ...baseConfig
};
