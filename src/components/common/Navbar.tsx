import React, { useState } from 'react';
import { ActiveTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Film, 
  HeartHandshake, 
  BookHeart,
  Plus
} from 'lucide-react';
import { AmbientSoundtrack } from './AudioPlayer';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  onNavigate?: (tab: ActiveTab) => void;
  onOpenAddMemory?: () => void;
  onStartReplay?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNavigate,
  onOpenAddMemory,
  onStartReplay,
}) => {
  const { profile, activePartner, switchDemoPartner } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: ActiveTab) => {
    setActiveTab?.(tab);
    onNavigate?.(tab);
  };

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'story', label: 'Our Story' },
    { id: 'memories', label: 'Memories' },
    { id: 'places', label: 'Places' },
    { id: 'letters', label: 'Letters' },
    { id: 'capsules', label: 'Capsules' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'bucketlist', label: 'Bucket List' },
    { id: 'future', label: 'Future' },
    { id: 'recap', label: 'Our 2026' },
    { id: 'settings', label: 'Settings' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#DFBF99]/15 bg-[#120815]/90 backdrop-blur-2xl transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <button
            id="brand-logo-btn"
            onClick={() => handleNav('home')}
            className="group flex items-center gap-2.5 text-left transition-opacity hover:opacity-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DFBF99]/30 bg-gradient-to-br from-[#2F1133] via-[#220D26] to-[#150718] p-0.5 shadow-md shadow-black/40 transition duration-300 group-hover:scale-105 group-hover:border-[#DFBF99]/50">
              <span className="font-serif text-lg font-normal tracking-wide text-[#FAF7F2]">D</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl font-normal tracking-[0.03em] text-[#FAF7F2]">
                  Dear Us
                </span>
                <Sparkles className="h-3 w-3 text-[#DFBF99]/75" />
              </div>
              <p className="text-[9px] font-sans tracking-[0.2em] uppercase text-[#DFBF99]/70">
                A Private Archive
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`relative px-3.5 py-1.5 text-xs font-sans tracking-wide transition-all duration-200 rounded-full ${
                  isActive
                    ? 'bg-[#2E1232] text-[#FAF7F2] shadow-sm border border-[#DFBF99]/30 font-medium'
                    : 'text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#220D25]/70 font-normal'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Ambient Sound Toggle */}
          <div className="hidden sm:block">
            <AmbientSoundtrack />
          </div>

          {/* Replay Cinematic Story Button */}
          <button
            id="nav-replay-btn"
            onClick={() => onStartReplay?.()}
            className="hidden md:flex items-center gap-1.5 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1.5 text-xs font-sans font-medium text-[#FAF7F2] shadow-sm transition hover:bg-[#341437] hover:border-[#DFBF99]/40 hover:text-white"
          >
            <Film className="h-3.5 w-3.5 text-[#DFBF99]" />
            <span>Replay Story</span>
          </button>

          {/* Quick Add Memory */}
          <button
            id="nav-add-memory-btn"
            onClick={() => onOpenAddMemory?.()}
            className="flex items-center gap-1.5 rounded-full border border-[#DFBF99]/30 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#6E1C3D] px-4 py-1.5 text-xs font-sans font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition duration-200 hover:brightness-110 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 text-[#F2E6D6]" />
            <span className="hidden sm:inline">Add Memory</span>
          </button>

          {/* Partner Switcher Pill */}
          <div className="flex items-center rounded-full border border-[#DFBF99]/20 bg-[#1A0B1E]/90 p-0.5 backdrop-blur-md shadow-sm">
            <button
              id="switch-partner-1"
              onClick={() => switchDemoPartner('partner-1')}
              title={`Logged in as ${profile.name}`}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition ${
                activePartner === 'partner-1'
                  ? 'bg-[#7D2146] text-[#FAF7F2] shadow-xs border border-[#DFBF99]/30'
                  : 'text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-4 w-4 rounded-full object-cover ring-1 ring-[#DFBF99]/40"
              />
              <span className="text-[11px] font-sans font-medium hidden sm:inline">{profile.name}</span>
            </button>

            <button
              id="switch-partner-2"
              onClick={() => switchDemoPartner('partner-2')}
              title={`Logged in as ${profile.partnerName}`}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition ${
                activePartner === 'partner-2'
                  ? 'bg-[#7D2146] text-[#FAF7F2] shadow-xs border border-[#DFBF99]/30'
                  : 'text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              <img
                src={profile.partnerAvatarUrl}
                alt={profile.partnerName}
                className="h-4 w-4 rounded-full object-cover ring-1 ring-[#DFBF99]/40"
              />
              <span className="text-[11px] font-medium hidden sm:inline">{profile.partnerName}</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DFBF99]/25 bg-[#1F0D24]/80 text-[#DFBF99] transition hover:text-white hover:bg-[#321237] hover:border-[#DFBF99]/40"
            title={`Switch to ${theme === 'dark' ? 'Light Ivory' : 'Cinematic Plum'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DFBF99]/25 text-[#FAF7F2] xl:hidden hover:bg-[#250E28]"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[#DFBF99]/15 bg-[#140816]/98 px-4 py-4 xl:hidden shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-2 gap-2 pb-3">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNav(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-left text-xs font-sans transition ${
                    isActive
                      ? 'bg-[#2E1232] text-[#FAF7F2] border border-[#DFBF99]/30 font-medium'
                      : 'text-[#C9B7C3] hover:bg-[#220D25]/70 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-[#DFBF99]/15 pt-3">
            <AmbientSoundtrack />
            <button
              onClick={() => {
                onStartReplay?.();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-full border border-[#DFBF99]/25 bg-[#250E28] px-3 py-1 text-xs text-[#FAF7F2]"
            >
              <Film className="h-3.5 w-3.5 text-[#DFBF99]" />
              <span>Replay Story</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
