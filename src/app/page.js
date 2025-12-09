// src/app/page.js
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSpotifyAuthUrl, isAuthenticated } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  
  // Cuando carga la página, verifica si ya está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      // Si ya tiene sesión, lo enviamos al dashboard
      router.push('/dashboard')
    }
  }, [router])
  
  // Función que ejecuta el login
  const handleLogin = () => {
    // Obtenemos la URL de autorización de Spotify
    const authUrl = getSpotifyAuthUrl()
    
    // Redirigimos al usuario a Spotify
    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          🎵 Spotify Taste Mixer
        </h1>
        
        <p className="text-xl text-gray-300 mb-8">
          Genera playlists personalizadas según tus gustos
        </p>
        
        <button 
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105"
        >
          Login con Spotify
        </button>
      </div>
    </div>
  )
}