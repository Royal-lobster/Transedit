import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverComponentsExternalPackages: ["node-catbox"],
	},
};

export default nextConfig;
