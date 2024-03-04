/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
module.exports = {
  reactStrictMode: true,
  transpilePackages:  [
    '@components',
    '@hooks',
    '@api'
  ],
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
};
