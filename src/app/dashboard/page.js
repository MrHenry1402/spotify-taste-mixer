// src/app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout, isAuthenticated, getAccessToken } from '@/lib/auth';
import DecadeWidget from '@/components/widgets/decada';
import GenresWidget from '@/components/widgets/genres';

export default function DashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para las preferencias de los widgets
  const [preferences, setPreferences] = useState({
    artists: [],
    tracks: [],
    genres: [],
    decades: [], // ← Aquí se guardarán las décadas seleccionadas
    popularity: [0, 100],
    mood: null
  });

  // Estado para la playlist generada
  const [playlist, setPlaylist] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    fetchUserProfile();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ← Handler para actualizar décadas
  const handleDecadeSelect = (selectedDecades) => {
    setPreferences(prev => ({
      ...prev,
      decades: selectedDecades
    }));
    console.log('Décadas seleccionadas:', selectedDecades);
  };

  // ← Handler para actualizar géneros
  const handleGenreSelect = (selectedGenres) => {
    setPreferences(prev => ({
      ...prev,
      genres: selectedGenres
    }));
    console.log('Géneros seleccionados:', selectedGenres);
  };

  const handleGeneratePlaylist = async () => {
    setGenerating(true);
    try {
      const token = getAccessToken();
      
      // Construir query string basado en los filtros
      let query = '';
      let queryParts = [];

      // Filtro por décadas (años)
      if (preferences.decades.length > 0) {
        const yearQueries = preferences.decades.map(decade => `year:${decade}`);
        queryParts.push(`(${yearQueries.join(' OR ')})`);
      }

      // Filtro por géneros
      if (preferences.genres.length > 0) {
        const genreQueries = preferences.genres.map(genre => `genre:"${genre}"`);
        queryParts.push(`(${genreQueries.join(' OR ')})`);
      }

      // Filtro por artistas
      if (preferences.artists.length > 0) {
        const artistQueries = preferences.artists.map(artist => `artist:"${artist}"`);
        queryParts.push(`(${artistQueries.join(' OR ')})`);
      }

      // Filtro por canciones específicas
      if (preferences.tracks.length > 0) {
        const trackQueries = preferences.tracks.map(track => `track:"${track}"`);
        queryParts.push(`(${trackQueries.join(' OR ')})`);
      }

      // Si no hay filtros, busca canciones populares
      if (queryParts.length === 0) {
        query = 'genre:pop year:2020-2024';
      } else {
        query = queryParts.join(' ');
      }

      // Construir parámetros de búsqueda
      const searchParams = new URLSearchParams({
        q: query,
        type: 'track',
        limit: 20,
        market: 'ES' // Puedes cambiar esto según el país del usuario
      });

      // Llamar a la API de búsqueda de Spotify
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?${searchParams}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const tracks = searchData.tracks?.items || [];
        
        if (tracks.length === 0) {
          alert('No se encontraron canciones con esos filtros. Intenta con otros parámetros.');
          setPlaylist([]);
        } else {
          // Filtrar por rango de popularidad
          const filtered = tracks.filter(track => {
            const popularity = track.popularity || 0;
            return popularity >= preferences.popularity[0] && 
                   popularity <= preferences.popularity[1];
          });

          setPlaylist(filtered.length > 0 ? filtered : tracks.slice(0, 10));
          console.log('Playlist generada:', filtered.length > 0 ? filtered : tracks);
        }
      } else {
        console.error('Error en la búsqueda:', searchResponse.status);
        alert('Error al generar la playlist. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error generando playlist:', error);
      alert('Error al generar la playlist');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-500">🎵 Spotify Taste Mixer</h1>
            {userProfile && (
              <p className="text-sm text-gray-400 mt-1">
                Hola, {userProfile.display_name}!
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna de Widgets (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-green-400">
                🎸 Personaliza tu Playlist
              </h2>
              <p className="text-gray-400 mb-4">
                Selecciona tus preferencias musicales usando los widgets de abajo
              </p>

              {/* Grid de Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ← GenresWidget integrado */}
                <GenresWidget
                  selectedGenres={preferences.genres}
                  onSelect={handleGenreSelect}
                />

                {/* ← DecadeWidget integrado */}
                <DecadeWidget
                  selectedDecades={preferences.decades}
                  onSelect={handleDecadeSelect}
                />

                {/* Widget de Artistas - Placeholder */}
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2">🎤 Artistas</h3>
                  <p className="text-sm text-gray-400">Widget de artistas aquí</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Seleccionados: {preferences.artists.length}
                  </div>
                </div>

                {/* Widget de Popularidad - Placeholder */}
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <h3 className="font-semibold mb-2">📊 Popularidad</h3>
                  <p className="text-sm text-gray-400">Widget de popularidad aquí</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Rango: {preferences.popularity[0]}-{preferences.popularity[1]}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGeneratePlaylist}
                disabled={generating}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 
                         px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {generating ? 'Generando...' : '🎵 Generar Playlist'}
              </button>
            </div>
          </div>

          {/* Columna de Playlist (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-green-400">
                🎧 Tu Playlist
              </h2>
              
              {playlist.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎵</div>
                  <p className="text-gray-400">
                    Aún no hay canciones.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Selecciona tus preferencias y genera tu playlist personalizada
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {playlist.map((track, index) => (
                    <div 
                      key={track.id || index}
                      className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        {track.album?.images?.[0] && (
                          <img 
                            src={track.album.images[0].url} 
                            alt={track.name}
                            className="w-12 h-12 rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{track.name}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {track.artists?.[0]?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {playlist.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm">
                      🔄 Refrescar
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">
                      ➕ Añadir más
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}