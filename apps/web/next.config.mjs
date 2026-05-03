/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-window"],
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
