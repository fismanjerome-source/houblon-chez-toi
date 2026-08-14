/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfkit charge ses fichiers de polices (.afm) par chemin relatif au module :
  // le bundler webpack casse ces chemins, donc on force Next à le laisser en
  // require() natif côté serveur plutôt que de l'inclure dans le bundle.
  experimental: {
    serverComponentsExternalPackages: ['pdfkit'],
  },
};

module.exports = nextConfig;
