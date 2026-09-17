import React, { useState, useEffect, useRef } from 'react';
import { Memory } from '../../types';
import { UnifiedAudioPlayer } from '../common/AudioPlayer';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  Filter, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Heart,
  Clock,
  ArrowLeft,
  X,
  RotateCcw
} from 'lucide-react';

interface MemoryReplayProps {
  memories: Memory[];
  onExit?: () => void;
}

export const MemoryReplay: React.FC<MemoryReplayProps> = ({ memories = [], onExit }) => {
  const safeMemories = memories || [];
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState<number>(5000); // 5 seconds
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [milestonesOnly, setMilestonesOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [audioSynth, setAudioSynth] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const categories = [
    'All',
    'Special',
    'Travel',
    'Birthday',
    'Festival',
    'Funny',
    'Everyday',
    'Achievement',
  ];

  // Extract years from memories
  const years = [
    'All',
    ...Array.from(
      new Set(
        safeMemories
          .filter((m) => m?.date)
          .map((m) => new Date(m.date).getFullYear().toString())
      )
    ).sort().reverse(),
  ];

  // Filter memories
  const replayList = safeMemories.filter((m) => {
    if (!m?.date) return false;
    if (selectedYear !== 'All') {
      const yr = new Date(m.date).getFullYear().toString();
      if (yr !== selectedYear) return false;
    }
    if (selectedCategory !== 'All' && m.category !== selectedCategory) {
      return false;
    }
    if (favoritesOnly && !m.isFavorite) {
      return false;
    }
    if (milestonesOnly && m.category !== 'Special' && !m.isFavorite) {
      return false;
    }
    return true;
  });

  const currentMemory = replayList[currentIndex] || replayList[0];

  // Slideshow interval timer
  useEffect(() => {
    if (!isPlaying || replayList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % replayList.length);
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, replayList.length, speed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Escape' && onExit) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [replayList.length, onExit]);

  // Ambient sound synthesizer loop
  useEffect(() => {
    if (!musicPlaying) {
      if (audioSynth) {
        audioSynth.stop();
        setAudioSynth(null);
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // Gentle A3
      gain.gain.setValueAtTime(0.015, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setAudioSynth({
        stop: () => {
          try {
            osc.stop();
            ctx.close();
          } catch {}
        },
      });
    } catch {}

    return () => {
      if (audioSynth) audioSynth.stop();
    };
  }, [musicPlaying]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleNext = () => {
    if (replayList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % replayList.length);
  };

  const handlePrev = () => {
    if (replayList.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + replayList.length) % replayList.length);
  };

  // Mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext(); // swipe left -> next
      } else {
        handlePrev(); // swipe right -> prev
      }
    }
    touchStartX.current = null;
  };

  const resetFilters = () => {
    setSelectedYear('All');
    setSelectedCategory('All');
    setFavoritesOnly(false);
    setMilestonesOnly(false);
    setCurrentIndex(0);
  };

  if (!currentMemory) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-dashed border-[#DFBF99]/30 bg-[#1B0B1E]/60 p-12 sm:p-16 backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7D2146]/40 border border-[#DFBF99]/30 text-[#DFBF99]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-3xl font-normal text-[#FAF7F2] mb-2">No memories found for this reel.</h2>
          <p className="text-sm text-[#C9B7C3] max-w-md mx-auto mb-6">
            Try adjusting or resetting your active year, favorite, or category filters to begin the projection.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-full border border-[#DFBF99]/40 bg-[#7D2146] px-6 py-2.5 text-xs font-sans font-medium text-[#FAF7F2] hover:bg-[#8B264E] transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Replay Filters</span>
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="rounded-full border border-[#DFBF99]/20 bg-[#250E28]/70 px-5 py-2.5 text-xs font-sans text-[#C9B7C3] hover:text-[#FAF7F2] transition"
              >
                Back to Vault
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentPhoto = currentMemory.photos?.[0] || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=85';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#DFBF99]/15 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {onExit && (
              <button
                onClick={onExit}
                className="flex items-center gap-1.5 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3 py-1 text-xs text-[#DFBF99] hover:bg-[#34133A] hover:text-[#FAF7F2] transition"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Exit Replay</span>
              </button>
            )}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99]">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-sans font-medium tracking-wide">Cinematic Projection</span>
            </div>
          </div>
          <h1 className="editorial-title text-4xl sm:text-5xl font-normal text-[#FAF7F2]">
            Memory Replay
          </h1>
          <p className="text-sm text-[#C9B7C3] mt-1.5 font-sans">
            A continuous, ambient retrospective of every chapter you have authored together.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 font-sans">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentIndex(0);
            }}
            className="rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1.5 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-[#1B0B1E] text-[#FAF7F2]">
                {y === 'All' ? 'All Years' : `Year ${y}`}
              </option>
            ))}
          </select>

          {/* Category selector */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentIndex(0);
            }}
            className="rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1.5 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#1B0B1E] text-[#FAF7F2]">
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Favorites only toggle */}
          <button
            onClick={() => {
              setFavoritesOnly(!favoritesOnly);
              setCurrentIndex(0);
            }}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              favoritesOnly
                ? 'border-[#DFBF99]/60 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
                : 'border-[#DFBF99]/20 bg-[#250E28]/70 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
            }`}
          >
            <Heart className={`h-3 w-3 ${favoritesOnly ? 'fill-current text-[#DFBF99]' : ''}`} />
            <span>Favorites Only</span>
          </button>

          {/* Milestones toggle */}
          <button
            onClick={() => {
              setMilestonesOnly(!milestonesOnly);
              setCurrentIndex(0);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              milestonesOnly
                ? 'border-[#DFBF99]/60 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
                : 'border-[#DFBF99]/20 bg-[#250E28]/70 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
            }`}
          >
            Milestones
          </button>
        </div>
      </div>

      {/* Main Cinematic Stage with Touch Swipe Handlers */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#DFBF99]/25 bg-black shadow-2xl shadow-black/80 select-none"
      >
        {/* Animated Background Photo with subtle zoom */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            key={currentMemory.id}
            src={currentPhoto}
            alt={currentMemory.title}
            className="h-full w-full object-cover transition-all duration-1000 transform scale-100 animate-fade-in"
          />
          {/* Cinematic Vignette & Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0510]/95 via-black/35 to-black/45" />
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/70" />
        </div>

        {/* Progress Bar Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center gap-1.5 z-20">
          {replayList.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className="h-1 flex-1 rounded-full overflow-hidden bg-white/20 backdrop-blur-md cursor-pointer"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-[#DFBF99] w-full shadow-sm shadow-[#DFBF99]'
                    : idx < currentIndex
                    ? 'bg-white/70 w-full'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Narrative Story Overlay (Bottom Left) */}
        <div className="absolute bottom-20 sm:bottom-24 left-6 right-6 sm:left-10 sm:right-24 z-20 pointer-events-none max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2 font-sans">
            <span className="rounded-full bg-[#1B0B1E]/80 backdrop-blur-md border border-[#DFBF99]/30 px-3 py-0.5 text-[11px] font-medium text-[#DFBF99] uppercase tracking-wider">
              {currentMemory.mood}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/90 font-mono">
              <Calendar className="h-3 w-3 text-[#DFBF99]" />
              <span>{new Date(currentMemory.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </span>
            {currentMemory.location && (
              <span className="flex items-center gap-1 text-xs text-white/90">
                <MapPin className="h-3 w-3 text-[#DFBF99]" />
                <span>{currentMemory.location}</span>
              </span>
            )}
            {currentMemory.isFavorite && (
              <span className="flex items-center gap-1 text-xs text-[#DFBF99]">
                <Heart className="h-3 w-3 fill-current" />
                <span>Cherished</span>
              </span>
            )}
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#FAF7F2] mb-3 leading-tight drop-shadow-md">
            {currentMemory.title}
          </h2>

          <p className="font-serif italic text-sm sm:text-base text-[#FAF7F2]/90 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-sm mb-2">
            &ldquo;{currentMemory.description}&rdquo;
          </p>

          {(currentMemory.songUrl || currentMemory.songTitle) && (
            <div className="pointer-events-auto mt-2 inline-block max-w-sm">
              <UnifiedAudioPlayer
                url={currentMemory.songUrl}
                title={currentMemory.songTitle || 'Memory Soundtrack'}
                subtitle="Memory Soundtrack"
                compact={true}
                idPrefix={`replay-${currentMemory.id}`}
              />
            </div>
          )}
        </div>

        {/* Cinematic Control Bar (Bottom Floating) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-xl bg-[#140816]/85 px-4 py-2.5 backdrop-blur-md border border-[#DFBF99]/25 shadow-lg">
          <div className="flex items-center gap-3 font-sans">
            {/* Play/Pause */}
            <button
              id="replay-play-pause-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#8B264E] text-[#FAF7F2] hover:scale-105 transition shadow-sm"
              title={isPlaying ? 'Pause Slideshow (Space)' : 'Play Slideshow (Space)'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

            {/* Prev / Next */}
            <button
              onClick={handlePrev}
              className="p-1.5 text-[#DFBF99]/80 hover:text-[#FAF7F2] transition"
              title="Previous Memory (Left Arrow)"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-[#DFBF99]/80 hover:text-[#FAF7F2] transition"
              title="Next Memory (Right Arrow)"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Counter */}
            <span className="text-[11px] font-mono text-[#DFBF99]/90 hidden xs:inline">
              {currentIndex + 1} / {replayList.length}
            </span>

            {/* Speed Selector */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-[#C9B7C3] ml-2">
              <Clock className="h-3.5 w-3.5 text-[#DFBF99]" />
              <button
                onClick={() => setSpeed(7000)}
                className={`px-2 py-0.5 rounded text-[11px] transition ${speed === 7000 ? 'bg-[#DFBF99]/20 text-[#DFBF99] font-medium' : 'hover:text-white'}`}
              >
                Slow
              </button>
              <button
                onClick={() => setSpeed(5000)}
                className={`px-2 py-0.5 rounded text-[11px] transition ${speed === 5000 ? 'bg-[#DFBF99]/20 text-[#DFBF99] font-medium' : 'hover:text-white'}`}
              >
                Medium
              </button>
              <button
                onClick={() => setSpeed(3000)}
                className={`px-2 py-0.5 rounded text-[11px] transition ${speed === 3000 ? 'bg-[#DFBF99]/20 text-[#DFBF99] font-medium' : 'hover:text-white'}`}
              >
                Fast
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 font-sans">
            {/* Ambient Music Toggle */}
            <button
              onClick={() => setMusicPlaying(!musicPlaying)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-white/5 transition"
              title="Toggle Ambient Audio"
            >
              {musicPlaying ? <Volume2 className="h-4 w-4 text-[#DFBF99]" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden sm:inline text-[11px]">{musicPlaying ? 'Harmonics On' : 'Muted'}</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-[#DFBF99]/80 hover:text-[#FAF7F2] hover:bg-white/5 rounded-lg transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

