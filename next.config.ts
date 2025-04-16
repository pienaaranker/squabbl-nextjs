import type { NextConfig } from "next";

export const config = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
};
