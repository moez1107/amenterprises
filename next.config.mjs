/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable Turbopack (use stable Webpack)
  turbopack: {},

  // Metadata base for social previews
  experimental: {
    metadataBase: 'https://amenterprises.com', // replace with your actual domain
  },

  // Optional: disable ESLint warnings in build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig