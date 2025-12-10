'use client';

import { useState, useEffect } from 'react';

export default function Popularidad({ selectedPopularity = [0, 100], onSelect }) {
  const [popularity, setPopularity] = useState(selectedPopularity);

  useEffect(() => {
    setPopularity(selectedPopularity);
  }, [selectedPopularity]);

  const handleMinChange = (e) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= popularity[1]) {
      const newPopularity = [newMin, popularity[1]];
      setPopularity(newPopularity);
      if (onSelect) {
        onSelect(newPopularity);
      }
    }
  };

  const handleMaxChange = (e) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= popularity[0]) {
      const newPopularity = [popularity[0], newMax];
      setPopularity(newPopularity);
      if (onSelect) {
        onSelect(newPopularity);
      }
    }
  };

  const handleReset = () => {
    const defaultPopularity = [0, 100];
    setPopularity(defaultPopularity);
    if (onSelect) {
      onSelect(defaultPopularity);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">📊 Popularidad</h3>
        {(popularity[0] !== 0 || popularity[1] !== 100) && (
          <button
            onClick={handleReset}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Resetear
          </button>
        )}
      </div>

      {/* Slider Container */}
      <div className="space-y-4">
        {/* Rango visible */}
        <div className="text-center">
          <p className="text-lg font-bold text-green-400">
            {popularity[0]} - {popularity[1]}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Rango de popularidad
          </p>
        </div>

        {/* Min Slider */}
        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Mínimo: {popularity[0]}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={popularity[0]}
            onChange={handleMinChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            style={{
              background: `linear-gradient(to right, #16a34a 0%, #16a34a ${popularity[0]}%, #4b5563 ${popularity[0]}%, #4b5563 100%)`
            }}
          />
        </div>

        {/* Max Slider */}
        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Máximo: {popularity[1]}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={popularity[1]}
            onChange={handleMaxChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            style={{
              background: `linear-gradient(to right, #16a34a 0%, #16a34a ${popularity[1]}%, #4b5563 ${popularity[1]}%, #4b5563 100%)`
            }}
          />
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-xs text-gray-400">
            📈 <span className="text-green-400">0-30:</span> Canciones poco populares
          </p>
          <p className="text-xs text-gray-400 mt-1">
            📈 <span className="text-green-400">30-70:</span> Canciones moderadamente populares
          </p>
          <p className="text-xs text-gray-400 mt-1">
            📈 <span className="text-green-400">70-100:</span> Canciones muy populares
          </p>
        </div>
      </div>
    </div>
  );
}
