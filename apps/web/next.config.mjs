/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-window"],
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      { source: "/socket.io/:path*", destination: `${apiUrl}/socket.io/:path*` },
    ];
  },
};

export default nextConfig;
