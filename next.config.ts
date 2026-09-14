import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Materiais cadastrados pela comunidade podem usar fotos de qualquer domínio HTTPS
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
