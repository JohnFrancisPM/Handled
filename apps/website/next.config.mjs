/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Only local/public images in MVP (logos, OG). No remote patterns needed.
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
