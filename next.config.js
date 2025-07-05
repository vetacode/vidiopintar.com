/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ytimg.com','res.cloudinary.com', 'lh3.googleusercontent.com'],
  },
  output: 'standalone'
}

module.exports = nextConfig
