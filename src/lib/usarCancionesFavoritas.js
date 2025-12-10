import { useState, useLayoutEffect } from 'react';

export function usarCancionesFavoritas() {
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar favoritos del localStorage
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem('spotify_favorite_tracks');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
    setIsLoaded(true);
  }, []);

  // Guardar favoritos en localStorage
  const saveFavorites = (updatedFavorites) => {
    setFavorites(updatedFavorites);
    localStorage.setItem('spotify_favorite_tracks', JSON.stringify(updatedFavorites));
  };

  // Añadir canción a favoritos
  const addFavorite = (track) => {
    if (!favorites.find(t => t.id === track.id)) {
      saveFavorites([...favorites, track]);
    }
  };

  // Eliminar canción de favoritos
  const removeFavorite = (trackId) => {
    saveFavorites(favorites.filter(t => t.id !== trackId));
  };

  // Verificar si una canción está en favoritos
  const isFavorite = (trackId) => {
    return favorites.some(t => t.id === trackId);
  };

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    isFavorite
  };
}
