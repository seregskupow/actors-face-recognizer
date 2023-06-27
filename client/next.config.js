const withPlugins = require('next-compose-plugins');
const withSvgr = require('next-svgr');
const path = require('path');
const {webpack} = require("next/dist/compiled/webpack/webpack");
/** @type {import('next').NextConfig} */
module.exports = withPlugins([withSvgr], {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  webpack: (config) => {
    config.plugins.push(
        new webpack.EnvironmentPlugin(process.env)
    );
    config.module.rules.push(
      {
        test: /\.(glb|gltf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {},
          },
        ],
      },
      // {
      //   test: /\.svg$/,
      //   loader: 'svg-inline-loader',
      //   options: {
      //     removeTags: false,
      //   },
      // }
    );

    return config;
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    prependData: `@import "main.scss";`,
  },
  images: {
    domains: [
      'cdn.sanity.io',
      'pbs.twimg.com',
      'lh3.googleusercontent.com',
      'res.cloudinary.com',
      'localhost',
      'resizing.flixster.com',
    ],
  },
  rewrites: async () => {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.SERVER}/:path*`, // Proxy to Backend
      },
    ];
  },
});
