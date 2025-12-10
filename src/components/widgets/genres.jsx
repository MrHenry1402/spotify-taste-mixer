'use client';

import { useState, useEffect } from 'react';

// Géneros musicales disponibles en Spotify
const GENRES = [
  { value: 'pop', label: 'Pop', emoji: '🎤' },
  { value: 'rock', label: 'Rock', emoji: '🎸' },
  { value: 'hip-hop', label: 'Hip-Hop', emoji: '🎙️' },
  { value: 'r-n-b', label: 'R&B', emoji: '🎹' },
  { value: 'electronic', label: 'Electrónica', emoji: '🎛️' },
  { value: 'dance', label: 'Dance', emoji: '💃' },
  { value: 'indie', label: 'Indie', emoji: '🎵' },
  { value: 'alternative', label: 'Alternative', emoji: '⚡' },
  { value: 'metal', label: 'Metal', emoji: '🤘' },
  { value: 'latin', label: 'Latino', emoji: '🥁' },
  { value: 'reggae', label: 'Reggae', emoji: '🌴' },
  { value: 'jazz', label: 'Jazz', emoji: '🎷' },
  { value: 'classical', label: 'Clásica', emoji: '🎻' },
  { value: 'country', label: 'Country', emoji: '🤠' },
  { value: 'blues', label: 'Blues', emoji: '🎸' },
  { value: 'soul', label: 'Soul', emoji: '💖' },
  { value: 'folk', label: 'Folk', emoji: '🪕' },
  { value: 'punk', label: 'Punk', emoji: '☠️' },
  { value: 'ambient', label: 'Ambient', emoji: '🌊' },
  { value: 'k-pop', label: 'K-Pop', emoji: '🌸' },
];

export default function GenresWidget({ selectedGenres = [], onSelect }) {
  const [selected, setSelected] = useState(selectedGenres);

  const toggleGenre = (genreValue) => {
    let newSelected;
    
    if (selected.includes(genreValue)) {
      // Si ya está seleccionado, lo quitamos
      newSelected = selected.filter(g => g !== genreValue);
    } else {
      // Si no está seleccionado, lo añadimos
      newSelected = [...selected, genreValue];
    }
    
    setSelected(newSelected);
    
    // Notificar al componente padre
    if (onSelect) {
      onSelect(newSelected);
    }
  };

  const clearSelection = () => {
    setSelected([]);
    if (onSelect) {
      onSelect([]);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">🎵 Géneros</h3>
        {selected.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Limpiar ({selected.length})
          </button>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Selecciona los géneros que te gustan
      </p>

      {/* Grid de géneros */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {GENRES.map((genre) => {
          const isSelected = selected.includes(genre.value);
          
          return (
            <button
              key={genre.value}
              onClick={() => toggleGenre(genre.value)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200
                flex flex-col items-center justify-center gap-1
                ${isSelected
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                }
              `}
            >
              <span className="text-2xl">{genre.emoji}</span>
              <span className="text-sm font-semibold text-center">{genre.label}</span>
            </button>
          );
        })}
      </div>

      {/* Resumen de selección */}
      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-xs text-gray-400 mb-2">Géneros seleccionados:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map(genreValue => {
              const genre = GENRES.find(g => g.value === genreValue);
              return (
                <span
                  key={genreValue}
                  className="px-2 py-1 bg-purple-500/30 text-purple-400 rounded text-xs flex items-center gap-1"
                >
                  {genre?.emoji} {genre?.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Info adicional */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        {selected.length === 0 
          ? 'Ningún género seleccionado'
          : `${selected.length} género${selected.length > 1 ? 's' : ''} seleccionado${selected.length > 1 ? 's' : ''}`
        }
      </div>
    </div>
  );
}
