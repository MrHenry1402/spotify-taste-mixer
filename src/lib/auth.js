// src/lib/auth.js

// Genera un string aleatorio para seguridad (CSRF protection)
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
}

// Genera la URL para redirigir al usuario a Spotify
export function getSpotifyAuthUrl() {
  const state = generateRandomString(16);
  
  // Guardamos el 'state' para verificarlo después (seguridad)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('spotify_auth_state', state);
  }
  
  // Los permisos que le pedimos a Spotify
  const scope = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'playlist-modify-public',
    'playlist-modify-private'
  ].join(' ');
  
  // Construimos la URL con todos los parámetros
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    state: state
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Guarda el token en localStorage
export function saveTokens(accessToken, refreshToken, expiresIn) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('spotify_token', accessToken);
    localStorage.setItem('spotify_refresh_token', refreshToken);
    
    // Calculamos cuándo expira el token (en milisegundos)
    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem('spotify_token_expiration', expirationTime.toString());
  }
}

// Obtiene el token guardado
export function getAccessToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('spotify_token');
  }
  return null;
}

// Verifica si el usuario está autenticado
export function isAuthenticated() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('spotify_token');
    const expiration = localStorage.getItem('spotify_token_expiration');
    
    if (!token || !expiration) return false;
    
    // Verificamos si el token ya expiró
    return Date.now() < parseInt(expiration);
  }
  return false;
}

// Cierra sesión
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiration');
  }
}