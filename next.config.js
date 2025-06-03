/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Performance optimization configuration
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    domains: ["*"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Configuration for handling Node.js modules in browser
  webpack: (config, { isServer }) => {
    // Only for client-side builds
    if (!isServer) {
      // Polyfills for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
        crypto: false,
        os: false,
        path: false,
      };
    }

    return config;
  },
};

export default config;
