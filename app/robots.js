const SITE_URL = process.env.SITE_URL || 'https://houblon-chez-toi-kohl.vercel.app';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/compte', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
