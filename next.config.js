/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  webpack: (config) => {
    // pdf.js references an optional Node-only 'canvas' module we don't use in the browser.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

module.exports = nextConfig;
