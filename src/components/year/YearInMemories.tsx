import React, { useState, useMemo } from 'react';
import { Memory, PlaceMemory } from '../../types';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Heart, 
  Image, 
  Award, 
  ArrowRight,
  TrendingUp,
  Share2
} from 'lucide-react';

interface YearInMemoriesProps {
  memories: Memory[];
  places: PlaceMemory[];
  onViewMemory: (memory: Memory) => void;
}

export const YearInMemories: React.FC<YearInMemoriesProps> = ({
  memories = [],
  places = [],
  onViewMemory,
}) => {
  const safeMemories = memories || [];
  const safePlaces = places || [];

  // Extract all distinct years from memories
  const years = useMemo(() => {
    const set = new Set<string>();
    safeMemories.forEach((m) => {
      if (m?.date) {
        const yr = new Date(m.date).getFullYear().toString();
        set.add(yr);
      }
    });
    const arr = Array.from(set).sort().reverse();
    return arr.length > 0 ? arr : [new Date().getFullYear().toString()];
  }, [safeMemories]);

  const [selectedYear, setSelectedYear] = useState<string>(years[0] || '2026');

  // Stats for the selected year
  const yearMemories = useMemo(() => {
    return safeMemories.filter((m) => m?.date && new Date(m.date).getFullYear().toString() === selectedYear);
  }, [safeMemories, selectedYear]);

  const yearPlaces = useMemo(() => {
    return safePlaces.filter((p) => p?.date && new Date(p.date).getFullYear().toString() === selectedYear);
  }, [safePlaces, selectedYear]);

  const totalPhotos = useMemo(() => {
    return yearMemories.reduce((acc, m) => acc + (m?.photos?.length || 0), 0);
  }, [yearMemories]);

  // Find most active month
  const mostCherishedMonth = useMemo(() => {
    if (yearMemories.length === 0) return 'Autumn';
    const monthCounts: { [key: number]: number } = {};
    yearMemories.forEach((m) => {
      const mon = new Date(m.date).getMonth();
      monthCounts[mon] = (monthCounts[mon] || 0) + 1;
    });
    let topMonth = 0;
    let maxCount = 0;
    Object.entries(monthCounts).forEach(([mon, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topMonth = parseInt(mon, 10);
      }
    });
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[topMonth];
  }, [yearMemories]);

  // Top memories of the year
  const topMoments = useMemo(() => {
    return yearMemories.filter((m) => m.isFavorite).slice(0, 3);
  }, [yearMemories]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-[#DFBF99]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-2.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-sans font-medium tracking-wide">Annual Retrospective</span>
          </div>
          <h1 className="editorial-title text-4xl sm:text-5xl font-normal text-[#FAF7F2]">
            Year in Memories
          </h1>
          <p className="text-sm text-[#C9B7C3] mt-2 font-sans">
            An annual tapestry celebrating the milestones, voyages, and quiet wonders of {selectedYear}.
          </p>
        </div>

        {/* Year Pills */}
        <div className="flex items-center gap-2 font-sans">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                selectedYear === y
                  ? 'border border-[#DFBF99]/50 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
                  : 'border border-[#DFBF99]/20 bg-[#250E28]/70 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Recap Banner / Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl border border-[#DFBF99]/18 bg-gradient-to-br from-[#240E2A]/85 to-[#160819]/85 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D2146]/30 text-[#DFBF99] border border-[#DFBF99]/20 mb-3">
            <Heart className="h-4 w-4 fill-current" />
          </div>
          <div className="font-mono text-3xl font-normal text-[#FAF7F2] mb-1">{yearMemories.length}</div>
          <div className="text-xs text-[#C9B7C3] font-sans">Moments Chronicled</div>
        </div>

        <div className="rounded-2xl border border-[#DFBF99]/18 bg-gradient-to-br from-[#240E2A]/85 to-[#160819]/85 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D2146]/30 text-[#DFBF99] border border-[#DFBF99]/20 mb-3">
            <Image className="h-4 w-4" />
          </div>
          <div className="font-mono text-3xl font-normal text-[#FAF7F2] mb-1">{totalPhotos}</div>
          <div className="text-xs text-[#C9B7C3] font-sans">Photographs Preserved</div>
        </div>

        <div className="rounded-2xl border border-[#DFBF99]/18 bg-gradient-to-br from-[#240E2A]/85 to-[#160819]/85 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D2146]/30 text-[#DFBF99] border border-[#DFBF99]/20 mb-3">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="font-mono text-3xl font-normal text-[#FAF7F2] mb-1">{yearPlaces.length}</div>
          <div className="text-xs text-[#C9B7C3] font-sans">Places Explored</div>
        </div>

        <div className="rounded-2xl border border-[#DFBF99]/18 bg-gradient-to-br from-[#240E2A]/85 to-[#160819]/85 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7D2146]/30 text-[#DFBF99] border border-[#DFBF99]/20 mb-3">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="font-serif text-2xl font-normal text-[#FAF7F2] mb-1 truncate">
            {mostCherishedMonth}
          </div>
          <div className="text-xs text-[#C9B7C3] font-sans">Most Cherished Month</div>
        </div>
      </div>

      {/* Spotlight Highlights of the Year */}
      <div className="rounded-2xl border border-[#DFBF99]/20 bg-[#17091A]/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Award className="h-5 w-5 text-[#DFBF99]" />
          <h2 className="editorial-title text-2xl sm:text-3xl font-normal text-[#FAF7F2]">
            Highlights of {selectedYear}
          </h2>
        </div>

        {yearMemories.length === 0 ? (
          <div className="text-center py-10 text-[#A896A4] font-sans">
            No memories logged for {selectedYear} yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(topMoments.length > 0 ? topMoments : yearMemories.slice(0, 3)).map((mem) => (
              <div
                key={mem.id}
                onClick={() => onViewMemory(mem)}
                className="group cursor-pointer overflow-hidden rounded-xl border border-[#DFBF99]/18 bg-[#250E28]/60 p-3.5 transition hover:border-[#DFBF99]/40 hover:bg-[#2F1133]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#280E2A] mb-3 border border-white/10">
                  <img
                    src={mem.photos?.[0] || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'}
                    alt={mem.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 rounded-full bg-[#140816]/80 px-2.5 py-0.5 text-[10px] text-[#DFBF99] backdrop-blur-md border border-[#DFBF99]/20 uppercase tracking-wider font-sans">
                    {mem.mood}
                  </div>
                </div>
                <div className="text-[10px] text-[#DFBF99] mb-1 font-mono uppercase">
                  {new Date(mem.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </div>
                <h4 className="font-serif text-lg font-normal text-[#FAF7F2] truncate group-hover:text-[#EADFD5] transition">
                  {mem.title}
                </h4>
                <p className="text-xs text-[#C9B7C3] mt-1 line-clamp-2 font-sans">{mem.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Romantic Year Sign-off Quote */}
      <div className="rounded-2xl border border-dashed border-[#DFBF99]/30 bg-gradient-to-r from-[#240E2A]/40 via-[#1B0B1E]/60 to-[#240E2A]/40 p-8 text-center backdrop-blur-md">
        <Heart className="mx-auto h-5 w-5 text-[#DFBF99] fill-current mb-3 opacity-90" />
        <p className="font-serif italic text-xl sm:text-2xl text-[#FAF7F2] max-w-xl mx-auto leading-relaxed">
          &ldquo;Another year written together in laughter, whispered promises, and gentle steps side-by-side.&rdquo;
        </p>
        <span className="text-xs text-[#DFBF99]/70 mt-3 block font-mono">
          Dear Us — {selectedYear} Chronicle
        </span>
      </div>
    </div>
  );
};
