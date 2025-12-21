/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "zxgyenfngezomchahikc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },

      // Google profile images
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
