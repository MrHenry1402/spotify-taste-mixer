'use client';

import { useState, useEffect } from 'react';

export default function Popularidad({ selectedPopularity = [0, 100], onSelect }) {
  const [range, setRange] = useState(selectedPopularity);
  const [minValue, setMinValue] = useState(selectedPopularity[0]);
  const [maxValue, setMaxValue] = useState(selectedPopularity[1]);

  useEffect(() => {
    setRange(selectedPopularity);
    setMinValue(selectedPopularity[0]);
    setMaxValue(selectedPopularity[1]);
  }, [selectedPopularity]);

  const handleMinChange = (e) => {
    const value = parseInt(e.target.value);
    if (value <= maxValue) {
      setMinValue(value);
      const newRange = [value, maxValue];
      setRange(newRange);
      if (onSelect) {
        onSelect(newRange);
      }
    }
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= minValue) {
      setMaxValue(value);
      const newRange = [minValue, value];
      setRange(newRange);
      if (onSelect) {
        onSelect(newRange);
      }
    }
  };

  const handleReset = () => {
    const defaultRange = [0, 100];
    setMinValue(0);
    setMaxValue(100);
    setRange(defaultRange);
    if (onSelect) {
      onSelect(defaultRange);
    }
  };

  const getPopularityLevel = () => {
    const avg = (minValue + maxValue) / 2;
    if (avg < 30) return { text: 'Canciones poco populares', color: 'text-blue-400' };
    if (avg < 70) return { text: 'Canciones moderadamente populares', color: 'text-yellow-400' };
    return { text: 'Canciones muy populares', color: 'text-green-400' };
  };

  const level = getPopularityLevel();

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">📊 Popularidad</h3>
        {(minValue !== 0 || maxValue !== 100) && (
          <button
            onClick={handleReset}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Resetear
          </button>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Filtra canciones por su nivel de popularidad
      </p>

      {/* Rango visible grande */}
      <div className="text-center mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-bold text-green-400">{minValue}</span>
          <span className="text-xl text-gray-400">—</span>
          <span className="text-3xl font-bold text-green-400">{maxValue}</span>
        </div>
        <p className={`text-sm mt-2 font-semibold ${level.color}`}>
          {level.text}
        </p>
      </div>

      {/* Contenedor de sliders con visualización */}
      <div className="space-y-4">
        {/* Visualización del rango */}
        <div className="relative h-3 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-green-600 to-green-400"
            style={{
              left: `${minValue}%`,
              width: `${maxValue - minValue}%`
            }}
          />
          {/* Marcadores */}
          <div
            className="absolute top-0 h-full w-1 bg-white shadow-lg"
            style={{ left: `${minValue}%` }}
          />
          <div
            className="absolute top-0 h-full w-1 bg-white shadow-lg"
            style={{ left: `${maxValue}%` }}
          />
        </div>

        {/* Slider Mínimo */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300 font-semibold">
              Mínimo
            </label>
            <span className="text-sm text-green-400 font-bold">{minValue}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={minValue}
            onChange={handleMinChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>

        {/* Slider Máximo */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300 font-semibold">
              Máximo
            </label>
            <span className="text-sm text-green-400 font-bold">{maxValue}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={maxValue}
            onChange={handleMaxChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>
      </div>

      {/* Info sobre los niveles */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600 space-y-2">
        <p className="text-xs text-gray-400">
          <span className="text-blue-400">⭐ 0-30:</span> Temas underground o nicho
        </p>
        <p className="text-xs text-gray-400">
          <span className="text-yellow-400">⭐ 30-70:</span> Canciones conocidas
        </p>
        <p className="text-xs text-gray-400">
          <span className="text-green-400">⭐ 70-100:</span> Hits y tendencias
        </p>
      </div>

      {/* Estilos CSS personalizados para el slider */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          background: #059669;
          transform: scale(1.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }

        .slider-thumb::-moz-range-thumb:hover {
          background: #059669;
          transform: scale(1.2);
        }

        .slider-thumb:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}