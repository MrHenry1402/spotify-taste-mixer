'use client';

import { useState } from 'react';

export default function CancionesFavoritas({ favorites, onRemoveFavorite, playlists, onAddTrackToPlaylist }) {
  const [showPlaylistSelect, setShowPlaylistSelect] = useState(null);

  const handleAddToPlaylist = (track, playlistId) => {
    onAddTrackToPlaylist(playlistId, track);
    setShowPlaylistSelect(null);
    alert(`✅ Canción añadida a la playlist`);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            ❤️ Canciones Favoritas
          </h2>
          <p className="text-gray-400">
            Todas tus canciones favoritas en un solo lugar
          </p>
        </div>
        <div className="text-white text-lg font-semibold">
          {favorites.length} canciones
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Aún no tienes canciones favoritas
          </h3>
          <p className="text-gray-400">
            Busca canciones y márcalas como favoritas para encontrarlas aquí
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="space-y-2">
            {favorites.map((track, index) => (
              <div
                key={track.id || index}
                className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 border border-gray-600 transition-colors group flex items-start gap-3"
              >
                {track.album?.images?.[0] && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="w-16 h-16 rounded flex-shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {track.name}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {track.artists?.[0]?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {track.album?.name}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span>⏱️ {formatDuration(track.duration_ms)}</span>
                    <span>⭐ {track.popularity}</span>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 relative">
                  <button
                    onClick={() => setShowPlaylistSelect(showPlaylistSelect === track.id ? null : track.id)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm transition-colors"
                    title="Añadir a playlist"
                  >
                    ➕ Playlist
                  </button>
                  <button
                    onClick={() => window.open(track.external_urls?.spotify, '_blank')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm transition-colors"
                  >
                    ▶️ Spotify
                  </button>
                  <button
                    onClick={() => onRemoveFavorite(track.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm transition-colors"
                  >
                    ❌ Eliminar
                  </button>

                  {/* Selector de playlist */}
                  {showPlaylistSelect === track.id && (
                    <div className="absolute top-12 left-0 bg-gray-900 border border-gray-600 rounded-lg p-3 z-50 min-w-60 shadow-lg">
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
