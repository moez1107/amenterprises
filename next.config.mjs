/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable modern optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Production optimization
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig