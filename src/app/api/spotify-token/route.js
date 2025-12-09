// src/app/api/spotify-token/route.js
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Obtenemos el código que nos envió el frontend
    const { code } = await request.json()
    
    // Preparamos las credenciales
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI
    
    // Codificamos las credenciales en Base64 (formato que pide Spotify)
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    
    // Hacemos la petición a Spotify para intercambiar código por token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener token')
    }
    
    // Devolvemos el token al frontend
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error en spotify-token:', error)
    return NextResponse.json(
      { error: 'Error al autenticar con Spotify' },
      { status: 500 }
    )
  }
}