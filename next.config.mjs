/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { appDir: true },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [{ key: "Cache-Control", value: "no-store" }]
    }
  ]
};
export default nextConfig;
