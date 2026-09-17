import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Memory } from '../../types';
import { MemoryCard } from './MemoryCard';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Plus, 
  Heart, 
  Lock, 
  Sparkles, 
  X,
  Compass,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';

interface MemoryVaultProps {
  memories: Memory[];
  onOpenAddModal: () => void;
  onViewMemory: (memory: Memory) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  memories = [],
  onOpenAddModal,
  onViewMemory,
  onToggleFavorite,
}) => {
  const safeMemories = memories || [];
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'shared' | 'private'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'favorites'>('newest');

  const categories = [
    'All',
    'Special',
    'Travel',
    'Birthday',
    'Festival',
    'Funny',
    'Everyday',
    'Achievement',
    'Other',
  ];

  const moods = [
    'All',
    'Love',
    'Peaceful',
    'Magical',
    'Emotional',
    'Adventure',
    'Celebration',
    'Funny',
  ];

  // Filter memories respecting privacy and selections
  const filteredMemories = useMemo(() => {
    return safeMemories
      .filter((mem) => {
        // Privacy check
        if (mem.isPrivate && mem.userId !== user?.id) {
          return false;
        }

        // Search query
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = Boolean(mem.title && mem.title.toLowerCase().includes(q));
          const matchDesc = Boolean(mem.description && mem.description.toLowerCase().includes(q));
          const matchLoc = Boolean(mem.location && mem.location.toLowerCase().includes(q));
          const matchCat = Boolean(mem.category && mem.category.toLowerCase().includes(q));
          const matchTags = Boolean(Array.isArray(mem.tags) && mem.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q)));
          if (!matchTitle && !matchDesc && !matchLoc && !matchCat && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && mem.category !== selectedCategory) {
          return false;
        }

        // Mood filter
        if (selectedMood !== 'All' && mem.mood !== selectedMood) {
          return false;
        }

        // Scope filter
        if (filterType === 'favorites' && !mem.isFavorite) return false;
        if (filterType === 'shared' && mem.isPrivate) return false;
        if (filterType === 'private' && !mem.isPrivate) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'favorites') {
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        }
        return 0;
      });
  }, [safeMemories, searchQuery, selectedCategory, selectedMood, filterType, sortBy, user?.id]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedMood('All');
    setFilterType('all');
    setSortBy('newest');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-[#DFBF99]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-2.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-sans font-medium tracking-wide">The Memory Vault</span>
          </div>
          <h1 className="editorial-title text-4xl sm:text-5xl font-normal text-[#FAF7F2]">
            Every Stored Chapter
          </h1>
          <p className="text-sm text-[#C9B7C3] mt-2 max-w-lg leading-relaxed font-sans">
            Search, filter, and relive every moment we have cataloged together.
          </p>
        </div>

        {/* Add Memory Button */}
        <button
          id="vault-add-memory-btn"
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-full border border-[#DFBF99]/30 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] shadow-lg shadow-black/30 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="rounded-2xl border border-[#DFBF99]/20 bg-[#1B0B1E]/85 p-5 mb-8 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/70" />
            <input
              id="vault-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, story, location, or #tag..."
              className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#230D27]/70 pl-10 pr-9 py-2.5 text-xs text-[#FAF7F2] placeholder-[#C9B7C3]/50 focus:border-[#DFBF99] focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9B7C3] hover:text-[#FAF7F2] transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Scope Filter Buttons (All / Favorites / Shared / Private) */}
          <div className="flex items-center rounded-xl border border-[#DFBF99]/25 bg-[#230D27]/70 p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                filterType === 'all'
                  ? 'bg-[#7D2146] text-[#FAF7F2] border border-[#DFBF99]/35 shadow-xs'
                  : 'text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('favorites')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                filterType === 'favorites'
                  ? 'bg-[#7D2146] text-[#FAF7F2] border border-[#DFBF99]/35 shadow-xs'
                  : 'text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              <Heart className="h-3 w-3 text-[#DFBF99]" />
              <span>Favorites</span>
            </button>
            <button
              onClick={() => setFilterType('shared')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                filterType === 'shared'
                  ? 'bg-[#7D2146] text-[#FAF7F2] border border-[#DFBF99]/35 shadow-xs'
                  : 'text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              Shared
            </button>
            <button
              onClick={() => setFilterType('private')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                filterType === 'private'
                  ? 'bg-[#7D2146] text-[#FAF7F2] border border-[#DFBF99]/35 shadow-xs'
                  : 'text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              <Lock className="h-3 w-3 text-[#DFBF99]" />
              <span>Private</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              id="vault-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-[#DFBF99]/25 bg-[#230D27]/70 px-4 py-2.5 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#1B0B1E]">Newest First</option>
              <option value="oldest" className="bg-[#1B0B1E]">Oldest First</option>
              <option value="title" className="bg-[#1B0B1E]">Title (A-Z)</option>
              <option value="favorites" className="bg-[#1B0B1E]">Favorites Top</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] uppercase tracking-wider text-[#DFBF99]/70 shrink-0 font-medium font-sans">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#7D2146] text-[#FAF7F2] border border-[#DFBF99]/40 font-medium shadow-xs'
                  : 'bg-[#230D27]/60 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#311337]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mood Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] uppercase tracking-wider text-[#DFBF99]/70 shrink-0 font-medium font-sans">
            Mood:
          </span>
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`rounded-full px-3 py-1 text-xs transition whitespace-nowrap ${
                selectedMood === m
                  ? 'bg-[#7D2146] text-[#FAF7F2] border border-[#DFBF99]/40 font-medium shadow-xs'
                  : 'bg-[#230D27]/60 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#311337]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Polaroid Cards */}
      {filteredMemories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onClick={() => onViewMemory(memory)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Emotionally beautiful empty state */
        <div className="rounded-2xl border border-dashed border-[#DFBF99]/30 bg-[#1B0B1E]/60 p-12 sm:p-16 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7D2146]/40 border border-[#DFBF99]/35 text-[#DFBF99] shadow-inner">
            <Heart className="h-6 w-6 fill-current opacity-85" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF7F2] mb-2">
            No memories yet.
          </h3>
          <p className="font-serif italic text-base sm:text-lg text-[#DFBF99] mb-3">
            &ldquo;Every great story starts with one moment.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-[#C9B7C3] max-w-sm mx-auto mb-7 leading-relaxed">
            {searchQuery || selectedCategory !== 'All' || selectedMood !== 'All' || filterType !== 'all'
              ? 'No memories match your active search filters.'
              : 'Begin crafting your shared archive together.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 rounded-full border border-[#DFBF99]/40 bg-[#7D2146] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] shadow-md hover:bg-[#8B264E] transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 text-[#DFBF99]" />
              <span>Capture First Memory</span>
            </button>
            {(searchQuery || selectedCategory !== 'All' || selectedMood !== 'All' || filterType !== 'all') && (
              <button
                onClick={resetFilters}
                className="rounded-full border border-[#DFBF99]/25 bg-[#250E28]/70 px-5 py-2.5 text-xs font-medium text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#321235] transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
