/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracing: false,
  env: {
    NEXT_PUBLIC_CLEANVERSE_APP_ID: process.env.NEXT_PUBLIC_CLEANVERSE_APP_ID,
    NEXT_PUBLIC_CLEANVERSE_DOCS_CODE: process.env.NEXT_PUBLIC_CLEANVERSE_DOCS_CODE,
    NEXT_PUBLIC_CLEANVERSE_API_URL: process.env.NEXT_PUBLIC_CLEANVERSE_API_URL,
  },
}

module.exports = nextConfig
