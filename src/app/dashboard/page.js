// src/app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout, isAuthenticated, getAccessToken } from '@/lib/auth';
import BarraLateral from '@/components/barraLateral';
import GenerarPlaylist from '@/components/generarPlaylist';
import BuscarCanciones from '@/components/buscarCanciones';
import MisPlaylists from '@/components/misPlaylists';
import CancionesFavoritas from '@/components/cancionesFavoritas';
import { usarPlaylists } from '@/lib/usarPlaylists';
import { usarCancionesFavoritas } from '@/lib/usarCancionesFavoritas';

export default function DashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('generate');

  // Hook para gestionar playlists locales
  const {
    playlists,
    isLoaded: playlistsLoaded,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist
  } = usarPlaylists();

  // Hook para gestionar canciones favoritas
  const {
    favorites,
    isLoaded: favoritesLoaded,
    addFavorite,
    removeFavorite
  } = usarCancionesFavoritas();

  // Estado para las preferencias de los widgets
  const [preferences, setPreferences] = useState({
    artists: [],
    tracks: [],
    genres: [],
    decades: [],
    popularity: [0, 100],
    mood: null
  });

  // Estado para la playlist generada
  const [playlist, setPlaylist] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [sortBy, setSortBy] = useState('added');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleImportFromSpotify = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        //console.log(data);
        let importCount = 0;

        for (const spotifyPlaylist of data.items) {
          try {
            // Obtener todas las canciones de la playlist primero
            const tracksResponse = await fetch(
              spotifyPlaylist.tracks.href,
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );

            if (tracksResponse.ok) {
              const tracksData = await tracksResponse.json();
              console.log(tracksData);
              const tracks = tracksData.items
                .filter(item => item.track) // Filtrar items nulos
                .map(item => ({
                  id: item.track.id,
                  name: item.track.name,
                  artists: item.track.artists,
                  album: item.track.album,
                  duration_ms: item.track.duration_ms,
                  popularity: item.track.popularity,
                  uri: item.track.uri,
                  external_urls: item.track.external_urls
                }));

              // Solo importar si tiene canciones
              if (tracks.length > 0) {
                // Crear la playlist localmente
                const newPlaylist = createPlaylist(spotifyPlaylist.name, spotifyPlaylist.description || '');
                
                // Esperar a que se cree la playlist
                setTimeout(() => {
                  // Añadir todas las canciones a la playlist
                  tracks.forEach(track => {
                    addTrackToPlaylist(newPlaylist.id, track);
                  });
                }, 100);

                importCount++;
              }
            }
          } catch (error) {
            console.error(`Error importing tracks for playlist ${spotifyPlaylist.name}:`, error);
          }
        }

        if (importCount > 0) {
          alert(`Se importaron ${importCount} playlists correctamente`);
        } else {
          alert('No se encontraron playlists con canciones para importar');
        }
      } else {
        alert('Error al obtener las playlists. Verifica tus permisos.');
      }
    } catch (error) {
      console.error('Error importing playlists:', error);
      alert('Error al importar playlists: ' + error.message);
    }
  };

  // Guardar playlist generada en Mis Playlists
  const handleSaveGeneratedPlaylist = (playlistName, tracks) => {
    if (tracks.length === 0) {
      alert('No hay canciones para guardar');
      return;
    }

    // Crear la playlist
    const newPlaylist = createPlaylist(playlistName, 'Playlist generada con filtros');
    
    // Esperar un poco para que se cree
    setTimeout(() => {
      // Añadir todas las canciones
      tracks.forEach(track => {
        addTrackToPlaylist(newPlaylist.id, track);
      });
      
      alert(`✅ Playlist "${playlistName}" guardada en Mis Playlists`);
      // Limpiar la playlist generada
      setPlaylist([]);
    }, 100);
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

      // Filtro por artistas (por ID, necesitamos obtener sus canciones)
      let allTracks = [];
      if (preferences.artists.length > 0) {
        // Fetch tracks for each selected artist
        for (const artistId of preferences.artists) {
          const artistResponse = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}/top_tracks?market=ES`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          if (artistResponse.ok) {
            const artistData = await artistResponse.json();
            allTracks = allTracks.concat(artistData.tracks || []);
          }
        }
      }

      // Filtro por canciones específicas
      if (preferences.tracks.length > 0) {
        const trackQueries = preferences.tracks.map(track => `track:"${track}"`);
        queryParts.push(`(${trackQueries.join(' OR ')})`);
      }

      // Si no hay filtros, busca canciones populares
      if (queryParts.length === 0 && allTracks.length === 0) {
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
        let tracks = searchData.tracks?.items || [];
        
        // Si hay artistas seleccionados, combinar con las canciones obtenidas
        if (allTracks.length > 0) {
          tracks = [...tracks, ...allTracks];
          // Remover duplicados por ID
          const uniqueMap = new Map();
          tracks.forEach(track => {
            if (!uniqueMap.has(track.id)) {
              uniqueMap.set(track.id, track);
            }
          });
          tracks = Array.from(uniqueMap.values());
        }
        
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
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <BarraLateral
        currentView={currentView}
        onViewChange={handleViewChange}
        userProfile={userProfile}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {currentView === 'generate' && (
          <GenerarPlaylist
            preferences={preferences}
            playlist={playlist}
            generating={generating}
            sortBy={sortBy}
            searchQuery={searchQuery}
            onPreferencesChange={setPreferences}
            onGeneratePlaylist={handleGeneratePlaylist}
            onPlaylistChange={setPlaylist}
            onSortChange={setSortBy}
            onSearchChange={setSearchQuery}
            onSavePlaylist={handleSaveGeneratedPlaylist}
            onAddFavorite={addFavorite}
            onRemoveFavorite={removeFavorite}
            favorites={favorites}
            playlists={playlists}
            onAddTrackToPlaylist={addTrackToPlaylist}
          />
        )}

        {currentView === 'search' && (
          <BuscarCanciones
            playlists={playlists}
            onAddTrackToPlaylist={addTrackToPlaylist}
            favorites={favorites}
            onAddFavorite={addFavorite}
            onRemoveFavorite={removeFavorite}
          />
        )}

        {currentView === 'favorites' && (
          <CancionesFavoritas
            favorites={favorites}
            onRemoveFavorite={removeFavorite}
            playlists={playlists}
            onAddTrackToPlaylist={addTrackToPlaylist}
          />
        )}

        {currentView === 'myPlaylists' && (
          <MisPlaylists
            playlists={playlists}
            onCreatePlaylist={createPlaylist}
            onDeletePlaylist={deletePlaylist}
            onUpdatePlaylist={updatePlaylist}
            onRemoveTrackFromPlaylist={removeTrackFromPlaylist}
            onAddFavorite={addFavorite}
            onRemoveFavorite={removeFavorite}
            favorites={favorites}
            onImportFromSpotify={handleImportFromSpotify}
            onAddTrackToPlaylist={addTrackToPlaylist}
          />
        )}
      </main>
    </div>
  );
}