/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ytimg.com','res.cloudinary.com'],
  },
  trustedOrigins: [
    "https://vidiopintar.com",
    "https://www.vidiopintar.com"
  ]
}

module.exports = nextConfig
