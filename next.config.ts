import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // Required for pdfjs-dist: configure 'canvas' to resolve to an empty module
    // This prevents errors when pdfjs-dist tries to import 'canvas' which is not needed on the server/client-side rendering
    config.resolve.alias.canvas = false;

    // Required for pdfjs-dist v4+ to work with Next.js app router
    // Copies the worker file to the static assets folder
    config.module.rules.push({
      test: /pdf\.worker\.min\.js/,
      type: 'asset/resource',
      generator: {
          filename: 'static/chunks/[name].[hash][ext]',
      },
    });


    return config;
  },
};

export default nextConfig;
