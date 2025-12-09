// src/app/dashboard/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, logout } from '@/lib/auth'

export default function Dashboard() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
      return
    }
    
    fetchUserProfile()
  }, [router])
  
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('spotify_token')
      
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al obtener perfil')
      }
      
      const data = await response.json()
      setUserProfile(data)
      setLoading(false)
      
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }
  
  const handleLogout = () => {
    logout()
    router.push('/')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-green-500">
              🎵 Spotify Taste Mixer
            </h1>
            {userProfile && (
              <div className="flex items-center gap-2">
                {userProfile.images && userProfile.images[0] && (
                  <img 
                    src={userProfile.images[0].url} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <span className="text-gray-300">
                  Hola, {userProfile.display_name}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2">
            ¡Bienvenido al Dashboard! 🎉
          </h2>
          <p className="text-gray-400 text-lg">
            Aquí irán los widgets para crear tu playlist perfecta
          </p>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-xl">
            Los widgets aparecerán aquí próximamente...
          </p>
        </div>
      </main>
    </div>
  )
}