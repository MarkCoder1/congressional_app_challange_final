import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdfjs-dist (and its native `@napi-rs/canvas` dependency) external to
  // the server bundle. Bundling pdfjs-dist breaks its Node-only `DOMMatrix`
  // polyfill and crashes route compilation during `next build`; leaving it
  // external lets Node load the native canvas module at runtime instead.
    devIndicators: false,
  serverExternalPackages: ["pdfjs-dist", "@napi-rs/canvas"],
};

export default nextConfig;
