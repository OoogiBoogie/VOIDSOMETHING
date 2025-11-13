import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  experimental: {
    optimizePackageImports: ["wagmi", "@tanstack/react-query"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  turbopack: {},
  webpack: (config, { isServer, webpack }) => {
    // 0) Resolve "@/..." to project root consistently
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd()),
    };

    // Ensure .tsx is always tried first
    config.resolve.extensions = [
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".json",
      ...(config.resolve.extensions || []),
    ];

    // 1) Never let browser bundle try to polyfill Node core
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        net: false,
        tls: false,
        child_process: false,
        worker_threads: false,
      };

      // 2) Hard block Hardhat/Node-only deps from client bundle
      Object.assign(config.resolve.alias ??= {}, {
        hardhat: false,
        "ethers/hardhat": false,
        "@nomicfoundation/hardhat-toolbox": false,
        "@nomicfoundation/hardhat-viem": false,
        "@nomicfoundation/hardhat-ethers": false,
        "@nomicfoundation/hardhat-verify": false,
        "@nomicfoundation/edr": false,
        "@ethersproject/providers": false,
        "viem/chains-legacy": false,
        "viem/_types/hardhat": false,
        "ganache": false,
        "@metamask/sdk": false,
        "@metamask/detect-provider": false,
      });

      // 3) Ignore anything that still slips through via transitive deps
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(hardhat|@nomicfoundation\/hardhat-(ethers|toolbox|viem|verify)|ganache|ethers\/hardhat)$/,
        })
      );

      // 4) Ignore dev/test/solidity in client bundles
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /\.(sol|t\.sol|spec\.(t|j)s|test\.(t|j)s)$/i,
        })
      );
    }

    // 5) Extension aliases for better resolution
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };

    return config;
  },
};

export default nextConfig;
