/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegúrate de que la configuración de output sea correcta para tu plataforma
  output: "standalone",
  
  // Si estás usando rutas con reescritura, verifica que estén correctamente configuradas
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/login',
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
