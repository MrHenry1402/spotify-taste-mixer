'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Artistas({ selectedGenres = [], selectedArtists = [], onSelect, favorites = [] }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculate top artists from favorite tracks
  useEffect(() => {
    const calculateTopArtists = () => {
      if (!favorites || favorites.length === 0) {
        setArtists([]);
        return;
      }

      setLoading(true);

      try {
        // Count artists by frequency in favorites
        const artistCount = {};
        const artistData = {};

        favorites.forEach(track => {
          if (track.artists && track.artists.length > 0) {
            track.artists.forEach(artist => {
              const artistId = artist.id;
              const artistName = artist.name;

              if (!artistCount[artistId]) {
                artistCount[artistId] = 0;
                artistData[artistId] = {
                  id: artistId,
                  name: artistName,
                  image: track.album?.images?.[0]?.url || null,
                  popularity: track.popularity || 0
                };
              }
              artistCount[artistId]++;
            });
          }
        });

        // Convert to array and sort by frequency (descending)
        const topArtists = Object.keys(artistCount)
          .map(artistId => ({
            ...artistData[artistId],
            count: artistCount[artistId],
            // Calculate weighted score: frequency + average popularity
            score: artistCount[artistId] * 10 + (artistData[artistId].popularity || 0) / 10
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 50); // Top 50 artists

        setArtists(topArtists);
      } catch (err) {
        console.error('Error calculating top artists:', err);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    calculateTopArtists();
  }, [favorites]);

  const toggleArtist = (artistId, artistName) => {
    let newSelected;
    
    if (selectedArtists.includes(artistId)) {
      newSelected = selectedArtists.filter(id => id !== artistId);
    } else {
      newSelected = [...selectedArtists, artistId];
    }
    
    if (onSelect) {
      onSelect(newSelected);
    }
  };

  const clearSelection = () => {
    if (onSelect) {
      onSelect([]);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">🎤 Tus Artistas</h3>
        {selectedArtists.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Limpiar ({selectedArtists.length})
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">
          Analizando favoritos...
        </p>
      ) : favorites.length === 0 ? (
        <p className="text-sm text-gray-400">
          Añade canciones a favoritos para ver tus artistas principales
        </p>
      ) : artists.length === 0 ? (
        <p className="text-sm text-gray-400">
          No se encontraron artistas en tus favoritos
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">
            Top artistas según tus {favorites.length} canciones favoritas
          </p>

          {/* Grid de artistas */}
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {artists.map((artist) => {
              const isSelected = selectedArtists.includes(artist.id);
              const imageUrl = artist.image;
              
              return (
                <button
                  key={artist.id}
                  onClick={() => toggleArtist(artist.id, artist.name)}
                  className={`
                    p-2 rounded-lg border-2 transition-all duration-200
                    flex flex-col items-center justify-center gap-1
                    ${isSelected
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }
                  `}
                  title={`${artist.name} - ${artist.count} canción${artist.count > 1 ? 'es' : ''}`}
                >
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={artist.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  )}
                  <span className="text-xs font-semibold text-center line-clamp-2 text-white">
                    {artist.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {artist.count}x
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
