/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@screenkit/core",
    "@screenkit/insert-bank",
    "@screenkit/insert-call",
    "@screenkit/insert-cctv",
    "@screenkit/insert-countdown",
    "@screenkit/insert-dying-video",
    "@screenkit/insert-messenger",
    "@screenkit/insert-remote",
    "@screenkit/insert-situation",
    "@screenkit/insert-text-file",
    "@screenkit/insert-tracker",
    "@screenkit/insert-tv-news",
    "@screenkit/insert-wanted",
  ],
}

export default nextConfig
