/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com", // if you're using Unsplash too
      // add any others your app uses
    ],
  },
};

export default nextConfig;
