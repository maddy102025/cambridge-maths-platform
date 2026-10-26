/** @type {import('next').NextConfig} */
const isCloudflareBuild = process.env.BUILD_TARGET === 'cloudflare';

const nextConfig = {
  ...(isCloudflareBuild
    ? {
        output: 'export',
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
