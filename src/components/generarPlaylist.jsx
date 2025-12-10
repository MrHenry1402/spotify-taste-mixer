'use client';

import { useState } from 'react';
import Decadas from '@/components/widgets/decadas';
import Generos from '@/components/widgets/generos';
import Artistas from '@/components/widgets/artistas';
import Popularidad from '@/components/widgets/popularidad';

export default function GenerarPlaylist({
  preferences,
  playlist,
  generating,
  sortBy,
  searchQuery,
  onPreferencesChange,
  onGeneratePlaylist,
  onPlaylistChange,
  onSortChange,
  onSearchChange,
  onSavePlaylist,
  onAddFavorite,
  onRemoveFavorite,
  favorites,
  playlists,
  onAddTrackToPlaylist
}) {
  const [playlistName, setPlaylistName] = useState('Mi playlist');
  const [showPlaylistSelect, setShowPlaylistSelect] = useState(null);

  const handleDecadeSelect = (selectedDecades) => {
    onPreferencesChange(prev => ({
      ...prev,
      decades: selectedDecades
    }));
  };

  const handleGenreSelect = (selectedGenres) => {
    onPreferencesChange(prev => ({
      ...prev,
      genres: selectedGenres
    }));
  };

  const handleArtistSelect = (selectedArtists) => {
    onPreferencesChange(prev => ({
      ...prev,
      artists: selectedArtists
    }));
  };

  const handleAddToPlaylist = (track, playlistId) => {
    onAddTrackToPlaylist(playlistId, track);
    setShowPlaylistSelect(null);
    alert(`✅ Canción añadida a la playlist`);
  };

  const removeTrackFromPlaylist = (trackId) => {
    onPlaylistChange(playlist.filter(track => track.id !== trackId));
  };

  const openTrackOnSpotify = (trackUri) => {
    window.open(`spotify:track:${trackUri}`, '_blank');
  };

  const getFilteredAndSortedPlaylist = () => {
    let filtered = playlist;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(track =>
        track.name.toLowerCase().includes(query) ||
        track.artists?.[0]?.name.toLowerCase().includes(query)
      );
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'popularity':
        sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'duration':
        sorted.sort((a, b) => (b.duration_ms || 0) - (a.duration_ms || 0));
        break;
      case 'artist':
        sorted.sort((a, b) =>
          (a.artists?.[0]?.name || '').localeCompare(b.artists?.[0]?.name || '')
        );
        break;
      case 'added':
      default:
        break;
    }

    return sorted;
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSavePlaylist = () => {
    if (playlist.length === 0) {
      alert('Primero genera una playlist');
      return;
    }
    if (!playlistName.trim()) {
      alert('Ingresa un nombre para la playlist');
      return;
    }
    onSavePlaylist(playlistName, playlist);
    setPlaylistName('Mi playlist');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          🎸 Personaliza tu Playlist
        </h2>
        <p className="text-gray-400">
          Selecciona tus preferencias musicales para generar una playlist personalizada
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de Widgets (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-green-400">
              Filtros
            </h3>

            {/* Grid de Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Generos
                selectedGenres={preferences.genres}
                onSelect={handleGenreSelect}
              />

              <Decadas
                selectedDecades={preferences.decades}
                onSelect={handleDecadeSelect}
              />

              <Artistas
                selectedGenres={preferences.genres}
                selectedArtists={preferences.artists}
                onSelect={handleArtistSelect}
                favorites={favorites}
              />

              <Popularidad
                selectedPopularity={preferences.popularity}
                onSelect={(newPopularity) =>
                  onPreferencesChange(prev => ({ ...prev, popularity: newPopularity }))
                }
              />
            </div>

            <button
              onClick={onGeneratePlaylist}
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
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-h-screen overflow-y-auto sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-green-400">
              🎧 Tu Playlist ({playlist.length})
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
              <>
                {/* Nombre de la playlist */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                    placeholder="Nombre de la playlist"
                  />
                </div>

                {/* Controles de búsqueda y ordenamiento */}
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />

                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                  >
                    <option value="added">Orden añadido</option>
                    <option value="popularity">Más populares</option>
                    <option value="duration">Duración</option>
                    <option value="artist">Artista (A-Z)</option>
                  </select>
                </div>

                {/* Lista de canciones */}
                <div className="space-y-2">
                  {getFilteredAndSortedPlaylist().map((track, index) => (
                    <div
                      key={track.id || index}
                      className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 border border-gray-600 transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-gray-400 text-xs font-semibold pt-1 w-6">
                          #{index + 1}
                        </div>

                        {track.album?.images?.[0] && (
                          <img
                            src={track.album.images[0].url}
                            alt={track.name}
                            className="w-12 h-12 rounded flex-shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-white">
                            {track.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {track.artists?.[0]?.name}
                          </p>
                          <div className="flex gap-2 mt-1 text-xs text-gray-500">
                            <span>⭐ {track.popularity || 0}</span>
                            <span>⏱️ {formatDuration(track.duration_ms || 0)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 relative">
                          <button
                            onClick={() => setShowPlaylistSelect(showPlaylistSelect === track.id ? null : track.id)}
                            title="Añadir a playlist"
                            className="bg-blue-600 hover:bg-blue-700 p-1.5 rounded text-white text-xs transition-colors"
                          >
                            ➕
                          </button>
                          <button
                            onClick={() => {
                              const isFavorite = favorites?.some(t => t.id === track.id);
                              if (isFavorite) {
                                onRemoveFavorite(track.id);
                              } else {
                                onAddFavorite(track);
                              }
                            }}
                            title={favorites?.some(t => t.id === track.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                            className={`p-1.5 rounded text-white text-xs transition-colors ${
                              favorites?.some(t => t.id === track.id)
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-gray-600 hover:bg-gray-500'
                            }`}
                          >
                            {favorites?.some(t => t.id === track.id) ? '❤️' : '🤍'}
                          </button>
                          <button
                            onClick={() => openTrackOnSpotify(track.uri)}
                            title="Abrir en Spotify"
                            className="bg-green-600 hover:bg-green-700 p-1.5 rounded text-white text-xs transition-colors"
                          >
                            ▶️
                          </button>
                          <button
                            onClick={() => removeTrackFromPlaylist(track.id)}
                            title="Eliminar"
                            className="bg-red-600 hover:bg-red-700 p-1.5 rounded text-white text-xs transition-colors"
                          >
                            ✕
                          </button>
                          
                          {/* Selector de playlist */}
                          {showPlaylistSelect === track.id && (
                            <div className="absolute bottom-0 right-12 bg-gray-900 border border-gray-600 rounded-lg p-2 z-50 min-w-48 shadow-lg">
                              <p className="text-xs font-semibold text-white mb-2 px-1">
                                Añadir a:
                              </p>
                              {playlists.length === 0 ? (
                                <p className="text-xs text-gray-400 px-2 py-1">
                                  Crea una playlist primero
                                </p>
                              ) : (
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {playlists.map(pl => (
                                    <button
                                      key={pl.id}
                                      onClick={() => handleAddToPlaylist(track, pl.id)}
                                      className="w-full text-left px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-white transition-colors"
                                    >
                                      {pl.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {searchQuery && getFilteredAndSortedPlaylist().length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    No se encontraron canciones
                  </div>
                )}
              </>
            )}

            {playlist.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onPlaylistChange([])}
                    className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    🗑️ Limpiar
                  </button>
                  <button
                    onClick={handleSavePlaylist}
                    className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    💾 Guardar en Mis Playlists
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
