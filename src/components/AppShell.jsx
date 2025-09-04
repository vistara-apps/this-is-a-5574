import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, Settings, User, Plus } from 'lucide-react';

const AppShell = ({ children, variant = 'default' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-white text-xl font-semibold">PumpPal</span>
              </div>
              {variant === 'dashboard' && (
                <nav className="hidden md:flex items-center space-x-6 ml-8">
                  <a href="#" className="text-white/80 hover:text-white transition-colors">Dashboard</a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">Projects</a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">Investors</a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">Analytics</a>
                </nav>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {variant === 'dashboard' && (
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                  <Plus size={16} />
                  <span>New ICO</span>
                </button>
              )}
              <ConnectButton />
              <button className="p-2 text-white/80 hover:text-white transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AppShell;