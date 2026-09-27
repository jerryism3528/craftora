const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      { source: '/verify', destination: '/email-verifier', permanent: true },
      { source: '/card-tools', destination: '/card-bin-tools', permanent: true },
      { source: '/tools', destination: '/all-tools', permanent: true },
      { source: '/tools/image-converter', destination: '/convert-image', permanent: true },
      { source: '/tools/:path*', destination: '/all-tools', permanent: true },
    ];
  },
  webpack: (config, { isServer }) => {
    // pdf.js references an optional Node-only 'canvas' module we don't use in the browser.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    // mupdf ships as a WASM module; enable async WebAssembly and layers.
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true };
    // Not needed in the browser bundle.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      module: false,
      url: false,
    };
    // mupdf imports Node built-ins with the "node:" scheme (node:fs, node:module).
    // Rewrite "node:xxx" to "xxx" so the fallbacks above handle them.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    );
    return config;
  },
};

module.exports = nextConfig;
