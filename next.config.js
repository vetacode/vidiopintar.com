/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ytimg.com','res.cloudinary.com', 'lh3.googleusercontent.com', 'media.licdn.com', 'scontent-sin2-1.cdninstagram.com'],
  },
  output: 'standalone'
}

module.exports = nextConfig
