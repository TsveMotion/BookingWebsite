/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "8qotiaucx4mnvpv0.public.blob.vercel-storage.com",
      "public.blob.vercel-storage.com",
      "lh3.googleusercontent.com",
      "res.cloudinary.com",
      "avatars.githubusercontent.com",
      "cdn.pixabay.com",
    ],
  },
};

export default nextConfig;
