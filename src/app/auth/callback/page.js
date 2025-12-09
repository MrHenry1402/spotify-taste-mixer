// src/app/auth/callback/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveTokens } from '@/lib/auth'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const handleCallback = async () => {
      // Obtenemos los parámetros de la URL
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')
      
      // Si hubo un error en Spotify
      if (errorParam) {
        setError('Error al autenticar con Spotify')
        return
      }
      
      // Verificamos el 'state' por seguridad (CSRF protection)
      const savedState = sessionStorage.getItem('spotify_auth_state')
      
      if (!state || state !== savedState) {
        setError('Error de seguridad en la autenticación')
        return
      }
      
      if (!code) {
        setError('No se recibió código de autorización')
        return
      }
      
      try {
        // Llamamos a nuestra API para intercambiar el código por token
        const response = await fetch('/api/spotify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error)
        }
        
        // Guardamos los tokens
        saveTokens(data.access_token, data.refresh_token, data.expires_in)
        
        // Limpiamos el state
        sessionStorage.removeItem('spotify_auth_state')
        
        // Redirigimos al dashboard
        router.push('/dashboard')
        
      } catch (error) {
        console.error('Error:', error)
        setError('Error al procesar la autenticación')
      }
    }
    
    handleCallback()
  }, [searchParams, router])
  
  // Mientras procesa, mostramos loading
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-green-500 text-white px-6 py-2 rounded"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-white text-xl">Autenticando con Spotify...</p>
      </div>
    </div>
  )
}