const baseConfig = require('../../libs/tailwind/tailwind.config');
const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    path.join(
      __dirname,
      '../../libs/components/src/**/*!(*.stories|*.spec).{ts,tsx,html}'
    )
  ],
  ...baseConfig
};
