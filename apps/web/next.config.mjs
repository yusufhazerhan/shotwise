/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@shotwise/core",
    "@shotwise/types",
    "@shotwise/db",
    "@shotwise/auth",
    "@shotwise/storage",
    "@shotwise/credits",
    "@shotwise/ui-primitives",
  ],
  serverExternalPackages: ["sharp", "@aws-sdk/client-s3"],
  output: "standalone",
  poweredByHeader: false,
  devIndicators: false,
  experimental: {
    devtoolSegmentExplorer: false,
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
