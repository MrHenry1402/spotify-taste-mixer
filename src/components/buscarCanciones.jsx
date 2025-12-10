'use client';

import { useState, useRef } from 'react';
import { getAccessToken } from '@/lib/auth';

export default function BuscarCanciones({ 
  playlists, 
  onAddTrackToPlaylist,
  favorites,
  onAddFavorite,
  onRemoveFavorite
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [showPlaylistSelect, setShowPlaylistSelect] = useState(null);
  const searchTimeoutRef = useRef(null);

  const isFavorite = (trackId) => {
    return favorites.some(t => t.id === trackId);
  };

  const searchTracks = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const token = getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=ES`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tracks?.items || []);
      }
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    
    // Debounce la búsqueda
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchTracks(value);
    }, 500);
  };

  const handleAddToPlaylist = (track, playlistId) => {
    onAddTrackToPlaylist(playlistId, track);
    setShowPlaylistSelect(null);
  };

  const handleToggleFavorite = (track) => {
    if (isFavorite(track.id)) {
      onRemoveFavorite(track.id);
    } else {
      onAddFavorite(track);
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          🔍 Buscar Canciones
        </h2>
        <p className="text-gray-400">
          Busca canciones en Spotify y añádelas a tus playlists
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Busca una canción, artista o álbum..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
            autoFocus
          />
        </div>

        {/* Resultados de búsqueda */}
        {searchResults.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searching ? 'Buscando...' : 'No se encontraron resultados'}
            </p>
          </div>
        ) : searching ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Buscando canciones...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map((track) => {
              const favorite = isFavorite(track.id);
              return (
                <div
                  key={track.id}
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 border border-gray-600 transition-colors flex items-start gap-3 group relative"
                >
                  {/* Imagen */}
                  {track.album?.images?.[0] && (
                    <img
                      src={track.album.images[0].url}
                      alt={track.name}
                      className="w-16 h-16 rounded flex-shrink-0"
                    />
                  )}

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {track.name}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {track.artists?.map(a => a.name).join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {track.album?.name}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span>⏱️ {formatDuration(track.duration_ms)}</span>
                      <span>⭐ {track.popularity}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => setShowPlaylistSelect(track.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm font-semibold transition-colors"
                    >
                      ➕ Añadir
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(track)}
                      className={`px-4 py-2 rounded text-white text-sm font-semibold transition-colors ${
                        favorite
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    >
                      {favorite ? '❌ Favorito' : '❤️ Favorito'}
                    </button>
                    <button
                      onClick={() => window.open(track.external_urls?.spotify, '_blank')}
                      className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white text-sm transition-colors"
                    >
                      ▶️ Spotify
                    </button>
                  </div>

                  {/* Selector de playlist */}
                  {showPlaylistSelect === track.id && (
                    <div className="absolute right-8 top-32 bg-gray-900 border border-gray-600 rounded-lg p-3 z-50 min-w-60 shadow-lg">
                      <p className="text-sm font-semibold text-white mb-3">
                        Añadir a playlist:
                      </p>
                      {playlists.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          Crea una playlist primero
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {playlists.map(playlist => (
                            <button
                              key={playlist.id}
                              onClick={() => handleAddToPlaylist(track, playlist.id)}
                              className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-white transition-colors"
                            >
                              {playlist.name}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setShowPlaylistSelect(null)}
                        className="w-full mt-3 text-xs text-gray-400 hover:text-gray-300"
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-400">
              Comienza a buscar canciones para añadirlas a tus playlists
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
