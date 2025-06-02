/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Конфигурация для улучшения производительности
  reactStrictMode: true,

  // Конфигурация для оптимизации изображений
  images: {
    domains: ["*"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Конфигурация для обработки Node.js модулей в браузере
  webpack: (config, { isServer }) => {
    // Только для клиентской сборки
    if (!isServer) {
      // Полифилы для Node.js модулей
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
