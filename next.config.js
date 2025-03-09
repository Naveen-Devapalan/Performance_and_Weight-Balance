/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel deployment doesn't require basePath and assetPrefix like GitHub Pages
  // Only apply these when specifically targeting GitHub Pages
  basePath: process.env.DEPLOYMENT_TARGET === 'github_pages' ? '/Performance_and_Weight-Balance' : '',
  assetPrefix: process.env.DEPLOYMENT_TARGET === 'github_pages' ? '/Performance_and_Weight-Balance/' : '',
  
  // For Vercel, we don't need 'export' output
  // Only use export for GitHub Pages
  output: process.env.DEPLOYMENT_TARGET === 'github_pages' ? 'export' : undefined,
  
  // Enable image optimization for Vercel, disable for static exports
  images: {
    unoptimized: process.env.DEPLOYMENT_TARGET === 'github_pages',
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;