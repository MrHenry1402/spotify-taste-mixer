import { useState, useLayoutEffect } from 'react';

export function usarPlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar playlists del localStorage
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem('spotify_playlists');
      if (saved) {
        setPlaylists(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
    setIsLoaded(true);
  }, []);

  // Guardar playlists en localStorage
  const savePlaylists = (updatedPlaylists) => {
    setPlaylists(updatedPlaylists);
    localStorage.setItem('spotify_playlists', JSON.stringify(updatedPlaylists));
  };

  // Crear una nueva playlist
  const createPlaylist = (name, description = '') => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      tracks: [],
      createdAt: new Date().toISOString(),
      source: 'local' // 'local' o 'spotify'
    };
    savePlaylists([...playlists, newPlaylist]);
    return newPlaylist;
  };

  // Actualizar una playlist
  const updatePlaylist = (playlistId, updates) => {
    const updated = playlists.map(p =>
      p.id === playlistId ? { ...p, ...updates } : p
    );
    savePlaylists(updated);
  };

  // Eliminar una playlist
  const deletePlaylist = (playlistId) => {
    savePlaylists(playlists.filter(p => p.id !== playlistId));
  };

  // Añadir canción a una playlist
  const addTrackToPlaylist = (playlistId, track) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        // Evitar duplicados
        if (!p.tracks.find(t => t.id === track.id)) {
          return { ...p, tracks: [...p.tracks, track] };
        }
      }
      return p;
    });
    savePlaylists(updated);
  };

  // Eliminar canción de una playlist
  const removeTrackFromPlaylist = (playlistId, trackId) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      }
      return p;
    });
    savePlaylists(updated);
  };

  return {
    playlists,
    isLoaded,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist
  };
}
