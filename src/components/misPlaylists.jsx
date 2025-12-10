'use client';

import { useState } from 'react';

export default function MisPlaylists({ 
  playlists, 
  onCreatePlaylist,
  onDeletePlaylist,
  onUpdatePlaylist,
  onRemoveTrackFromPlaylist,
  onAddFavorite,
  onRemoveFavorite,
  favorites,
  onImportFromSpotify,
  onAddTrackToPlaylist
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showPlaylistSelect, setShowPlaylistSelect] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName, newPlaylistDescription);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateModal(false);
    }
  };

  const handleAddToAnotherPlaylist = (track, targetPlaylistId) => {
    // Don't add to the same playlist we're viewing
    if (targetPlaylistId === selectedPlaylist.id) {
      alert('La canción ya está en esta playlist');
      return;
    }
    onAddTrackToPlaylist(targetPlaylistId, track);
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
            🎧 Mis Playlists
          </h2>
          <p className="text-gray-400">
            Crea y gestiona tus playlists personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-semibold transition-colors"
          >
            ➕ Nueva Playlist
          </button>
          <button
            onClick={onImportFromSpotify}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-semibold transition-colors"
          >
            📥 Importar de Spotify
          </button>
        </div>
      </div>

      {/* Modal crear playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Crear Nueva Playlist
            </h3>
            <input
              type="text"
              placeholder="Nombre de la playlist"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-3 focus:outline-none focus:border-green-500"
              autoFocus
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={newPlaylistDescription}
              onChange={(e) => setNewPlaylistDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4 focus:outline-none focus:border-green-500 h-24 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-semibold transition-colors"
              >
                Crear
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Aún no tienes playlists
          </h3>
          <p className="text-gray-400 mb-4">
            Crea tu primera playlist o importa una desde Spotify
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white font-semibold transition-colors"
          >
            ➕ Crear Playlist
          </button>
        </div>
      ) : selectedPlaylist ? (
        // Vista de detalle de playlist
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {selectedPlaylist.name}
              </h3>
              {selectedPlaylist.description && (
                <p className="text-gray-400 mt-1">{selectedPlaylist.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {selectedPlaylist.tracks?.length || 0} canciones
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onDeletePlaylist(selectedPlaylist.id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-colors"
              >
                🗑️ Eliminar
              </button>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white transition-colors"
              >
                ← Atrás
              </button>
            </div>
          </div>

          {/* Lista de canciones */}
          {selectedPlaylist.tracks?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No hay canciones en esta playlist</p>
              <p className="text-sm mt-2">Busca canciones para añadirlas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedPlaylist.tracks.map((track, index) => {
                const isFavorite = favorites.some(t => t.id === track.id);
                return (
                  <div
                    key={track.id || index}
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 border border-gray-600 transition-colors group flex items-start gap-3"
                  >
                    {track.album?.images?.[0] && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.name}
                        className="w-12 h-12 rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {track.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {track.artists?.[0]?.name}
                      </p>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        <span>⏱️ {formatDuration(track.duration_ms)}</span>
                        <span>⭐ {track.popularity}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                      <button
                        onClick={() => setShowPlaylistSelect(showPlaylistSelect === track.id ? null : track.id)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm transition-colors"
                        title="Añadir a otra playlist"
                      >
                        ➕
                      </button>
                      <button
                        onClick={() => {
                          if (isFavorite) {
                            onRemoveFavorite(track.id);
                          } else {
                            onAddFavorite(track);
                          }
                        }}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          isFavorite
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                        }`}
                      >
                        {isFavorite ? '❤️' : '🤍'}
                      </button>
                      <button
                        onClick={() => onRemoveTrackFromPlaylist(selectedPlaylist.id, track.id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm transition-colors"
                      >
                        ✕
                      </button>

                      {/* Selector de playlist */}
                      {showPlaylistSelect === track.id && (
                        <div className="absolute top-10 left-0 bg-gray-900 border border-gray-600 rounded-lg p-3 z-50 min-w-60 shadow-lg">
                          <p className="text-sm font-semibold text-white mb-3">
                            Copiar a:
                          </p>
                          {playlists.filter(p => p.id !== selectedPlaylist.id).length === 0 ? (
                            <p className="text-xs text-gray-400">
                              No hay otras playlists
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {playlists.filter(p => p.id !== selectedPlaylist.id).map(playlist => (
                                <button
                                  key={playlist.id}
                                  onClick={() => handleAddToAnotherPlaylist(track, playlist.id)}
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
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Vista de lista de playlists
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(playlist => (
            <div
              key={playlist.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors cursor-pointer group"
            >
              <div className="relative mb-4 h-40 bg-gradient-to-br from-green-600 to-green-900 rounded-lg flex items-center justify-center overflow-hidden">
                {playlist.source === 'spotify' && playlist.image ? (
                  <img
                    src={playlist.image}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-6xl">🎧</div>
                )}
                {playlist.source === 'spotify' && (
                  <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Spotify
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                {playlist.name}
              </h3>

              {playlist.description && (
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                  {playlist.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <p>📊 {playlist.tracks?.length || 0} canciones</p>
                {favorites && (
                  <p>❤️ {favorites.filter(fav => playlist.tracks?.some(t => t.id === fav.id)).length} favoritas</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-colors"
                >
                  📝 Editar
                </button>
                <button
                  onClick={() => window.open(playlist.external_urls?.spotify, '_blank')}
                  className={`flex-1 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${
                    playlist.source === 'spotify'
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={playlist.source !== 'spotify'}
                >
                  🎧 Spotify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
