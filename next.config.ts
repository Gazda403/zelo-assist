import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Google user profile avatars (via NextAuth / Google OAuth)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // GitHub avatars (if used)
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // Only bundle the specific icons/components actually imported — cuts JS size significantly
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
  // Packages that use native Node.js modules must run server-side only.
  // This prevents Vercel from trying to bundle them for the Edge runtime.
  serverExternalPackages: ["googleapis", "google-auth-library"],
  transpilePackages: ["@splinetool/react-spline", "@splinetool/runtime"],
};


export default nextConfig;
