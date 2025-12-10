'use client';

import { useState } from 'react';

export default function BarraLateral({ currentView, onViewChange, userProfile, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'generate',
      label: 'Generar Playlist',
      icon: '🎵',
      description: 'Crea con filtros'
    },
    {
      id: 'search',
      label: 'Buscar Canciones',
      icon: '🔍',
      description: 'Busca y añade'
    },
    {
      id: 'favorites',
      label: 'Canciones Favoritas',
      icon: '❤️',
      description: 'Tus favoritas'
    },
    {
      id: 'myPlaylists',
      label: 'Mis Playlists',
      icon: '🎧',
      description: 'Tus playlists'
    }
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gray-900 border-r border-gray-700 h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-50`}
    >
      {/* Logo y toggle */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="text-2xl">🎧</div>
            <div>
              <h1 className="font-bold text-green-500">Mixer</h1>
              <p className="text-xs text-gray-400">Spotify</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menú principal */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full p-3 rounded-lg transition-colors flex items-center gap-3 ${
              currentView === item.id
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            title={isCollapsed ? item.label : ''}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {!isCollapsed && (
              <div className="text-left">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs opacity-75">{item.description}</p>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Perfil de usuario y logout */}
      <div className="p-4 border-t border-gray-700 space-y-3">
        {userProfile && !isCollapsed && (
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            {userProfile.images?.[0] && (
              <img
                src={userProfile.images[0].url}
                alt={userProfile.display_name}
                className="w-12 h-12 rounded-full mx-auto mb-2"
              />
            )}
            <p className="text-sm font-semibold text-white truncate">
              {userProfile.display_name}
            </p>
            <p className="text-xs text-gray-400">{userProfile.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          {!isCollapsed && 'Cerrar Sesión'}
        </button>
      </div>
    </aside>
  );
}
