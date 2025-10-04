import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "picsum.photos",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "m.media-amazon.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "fanatics.frgimages.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "www.theharvardshop.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "encrypted-tbn0.gstatic.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.randomhouse.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.footballfanatics.com",
				port: "",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
