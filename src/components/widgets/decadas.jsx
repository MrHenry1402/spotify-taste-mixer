'use client';

import { useState } from 'react';

const DECADES = [
  { value: '1950', label: '1950s' },
  { value: '1960', label: '1960s' },
  { value: '1970', label: '1970s' },
  { value: '1980', label: '1980s' },
  { value: '1990', label: '1990s' },
  { value: '2000', label: '2000s' },
  { value: '2010', label: '2010s' },
  { value: '2020', label: '2020s' }
];

export default function Decadas({ selectedDecades = [], onSelect }) {
  const [selected, setSelected] = useState(selectedDecades);

  const toggleDecade = (decadeValue) => {
    let newSelected;
    
    if (selected.includes(decadeValue)) {
      // Si ya está seleccionada, la quitamos
      newSelected = selected.filter(d => d !== decadeValue);
    } else {
      // Si no está seleccionada, la añadimos
      newSelected = [...selected, decadeValue];
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
        <h3 className="font-semibold text-lg">📅 Décadas</h3>
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
        Selecciona las décadas que te gustan
      </p>

      {/* Grid de décadas */}
      <div className="grid grid-cols-2 gap-2">
        {DECADES.map((decade) => {
          const isSelected = selected.includes(decade.value);
          
          return (
            <button
              key={decade.value}
              onClick={() => toggleDecade(decade.value)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200
                flex flex-col items-center justify-center gap-1
                ${isSelected
                  ? 'border-green-500 bg-green-500/20 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                }
              `}
            >
              <span className="text-sm font-semibold">{decade.label}</span>
            </button>
          );
        })}
      </div>

      {/* Resumen de selección */}
      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-xs text-gray-400 mb-2">Décadas seleccionadas:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map(decadeValue => {
              const decade = DECADES.find(d => d.value === decadeValue);
              return (
                <span
                  key={decadeValue}
                  className="px-2 py-1 bg-green-500/30 text-green-400 rounded text-xs flex items-center gap-1"
                >
                  {decade?.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Info adicional */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        {selected.length === 0 
          ? 'Ninguna década seleccionada'
          : `${selected.length} década${selected.length > 1 ? 's' : ''} seleccionada${selected.length > 1 ? 's' : ''}`
        }
      </div>
    </div>
  );
}