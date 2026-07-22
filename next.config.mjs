/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true    
  },
  trailingSlash: true,
  allowedDevOrigins: ['http://10.65.19.13:3000/']
};

export default nextConfig;
