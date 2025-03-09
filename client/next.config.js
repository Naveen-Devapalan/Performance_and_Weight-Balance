/** @type {import('next').NextConfig} */
const nextConfig = {
  // Setting the base path for GitHub Pages - this should match your repository name
  basePath: process.env.NODE_ENV === 'production' ? '/Performance_and_Weight-Balance' : '',
  
  // Setting the asset prefix for GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Performance_and_Weight-Balance/' : '',
  
  // Enable static exports for GitHub Pages
  output: 'export',
  
  // Disable image optimization since it's not supported in static exports
  images: {
    unoptimized: true,
  },

  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;