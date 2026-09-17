import React from 'react';
import { motion } from 'motion/react';
import { Memory, PlaceMemory, FutureLetter, CountdownEvent, ActiveTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Calendar, 
  Camera, 
  MapPin, 
  Mail, 
  Shuffle, 
  Clock, 
  Heart,
  ChevronRight,
  Flame,
  Compass
} from 'lucide-react';

interface HeroSectionProps {
  memories: Memory[];
  places: PlaceMemory[];
  letters: FutureLetter[];
  countdowns: CountdownEvent[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddMemory: () => void;
  onOpenRandomMemory: () => void;
  onViewMemory: (memory: Memory) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  memories = [],
  places = [],
  letters = [],
  countdowns = [],
  onNavigate,
  onOpenAddMemory,
  onOpenRandomMemory,
  onViewMemory,
}) => {
  const { profile } = useAuth();

  const safeMemories = memories || [];
  const safePlaces = places || [];
  const safeLetters = letters || [];
  const safeCountdowns = countdowns || [];

  const totalMemories = safeMemories.length;
  const totalPhotos = safeMemories.reduce((acc, m) => acc + (m?.photos?.length || 0), 0) +
    safePlaces.reduce((acc, p) => acc + (p?.photos?.length || 0), 0);
  const totalPlaces = safePlaces.length;
  const totalLetters = safeLetters.length;

  // Next countdown event
  const upcomingEvent = safeCountdowns[0] || {
    title: 'Our Next Anniversary',
    targetDate: '2027-04-14',
    category: 'Anniversary',
  };

  const getDaysUntil = (dateStr: string) => {
    if (!dateStr) return 0;
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Find "On This Day" memory: today's month & day in past years, or favorite/first
  const today = new Date();
  const currentYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  const exactOnThisDayMemory = safeMemories.find((m) => {
    if (!m?.date) return false;
    const d = new Date(m.date);
    return d.getMonth() + 1 === todayMonth && d.getDate() === todayDate && d.getFullYear() < currentYear;
  });

  const onThisDayMemory = exactOnThisDayMemory || safeMemories.find((m) => m?.isFavorite) || safeMemories[0];

  const getYearOffsetLabel = (dateStr?: string) => {
    if (!dateStr) return 'From Our Vault';
    const mYear = new Date(dateStr).getFullYear();
    const diff = currentYear - mYear;
    if (diff <= 0) return 'Recent Moment';
    if (diff === 1) return '1 year ago';
    return `${diff} years ago`;
  };

  // Floating polaroids around the hero
  const polaroids = safeMemories.slice(0, 3);

  return (
    <div className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
      {/* Soft gradient lighting blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[560px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#7D2146]/20 via-[#4A1538]/15 to-transparent blur-3xl opacity-70" />
      <div className="pointer-events-none absolute top-40 right-[-100px] -z-10 h-[450px] w-[450px] rounded-full bg-[#DFBF99]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-80 left-[-100px] -z-10 h-[420px] w-[420px] rounded-full bg-[#8B264E]/12 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center max-w-3xl mx-auto"
        >
          {/* Subtle Tag with Champagne Accent */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/30 bg-[#200C24]/80 px-4 py-1.5 text-xs text-[#FAF7F2] backdrop-blur-md mb-6 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#DFBF99]" />
            <span className="font-sans font-medium tracking-wide">
              {profile.name} &amp; {profile.partnerName} &bull; <span className="text-[#DFBF99]">Together Since {new Date(profile.relationshipStartDate).getFullYear()}</span>
            </span>
          </motion.div>

          {/* Large "Dear Us" title */}
          <h1 className="editorial-title text-6xl sm:text-7xl lg:text-8xl font-normal text-[#FAF7F2] mb-6 tracking-tight drop-shadow-sm">
            Dear Us
          </h1>

          {/* Emotional Subtitle */}
          <p className="font-serif italic text-xl sm:text-2xl text-[#EADFD5] leading-relaxed max-w-xl mx-auto mb-10 font-normal">
            &ldquo;Every moment has a story. Ours deserves to be remembered.&rdquo;
          </p>

          {/* Premium CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <button
              id="hero-enter-story-btn"
              onClick={() => onNavigate('story')}
              className="group flex items-center gap-2.5 rounded-full border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-8 py-3 text-sm font-sans font-medium text-[#FAF7F2] shadow-xl shadow-black/40 transition-all duration-300 hover:scale-[1.02] hover:border-[#DFBF99]/70 hover:brightness-110 active:scale-95"
            >
              <span>Enter Our Story</span>
              <ArrowRight className="h-4 w-4 text-[#DFBF99] transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              id="hero-add-memory-btn"
              onClick={onOpenAddMemory}
              className="flex items-center gap-2 rounded-full border border-[#DFBF99]/30 bg-[#230D28]/85 px-6 py-3 text-sm font-sans font-medium text-[#FAF7F2] backdrop-blur-md transition-all duration-300 hover:bg-[#311337] hover:border-[#DFBF99]/50 hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-4 w-4 text-[#DFBF99]" />
              <span>Add a Memory</span>
            </button>

            <button
              id="hero-random-memory-btn"
              onClick={onOpenRandomMemory}
              title="Rediscover a spontaneous memory"
              className="flex items-center gap-2 rounded-full border border-[#DFBF99]/18 bg-[#1A0B1E]/75 px-5 py-3 text-sm font-sans font-medium text-[#C9B7C3] backdrop-blur-md transition hover:text-[#FAF7F2] hover:bg-[#260E2A] active:scale-95"
            >
              <Shuffle className="h-4 w-4 text-[#DFBF99]/80" />
              <span>Rediscover</span>
            </button>
          </div>
        </motion.div>

        {/* Floating / Tilted Memory Cards with entrance animations */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-5xl mb-14"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {polaroids.map((mem, index) => {
              const rotations = ['md:-rotate-1.5', 'md:rotate-1', 'md:-rotate-1'];
              return (
                <div
                  key={mem.id}
                  id={`hero-card-${mem.id}`}
                  onClick={() => onViewMemory(mem)}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-[#DFBF99]/20 bg-[#1D0C22]/85 p-3.5 shadow-xl backdrop-blur-md transition-all duration-300 hover:rotate-0 hover:-translate-y-2 hover:shadow-2xl hover:border-[#DFBF99]/40 hover:bg-[#28102E] ${rotations[index % 3]}`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#260D2A]">
                    <img
                      src={mem?.photos?.[0] || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85'}
                      alt={mem.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-85 group-hover:opacity-75 transition-opacity" />
                    
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center rounded-full bg-black/60 border border-[#DFBF99]/25 px-2.5 py-0.5 text-[10px] font-sans font-medium text-[#FAF7F2] backdrop-blur-md">
                        {mem.mood}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-[#FAF7F2]">
                      <span className="font-serif italic text-sm text-[#FAF7F2] truncate max-w-[170px]">
                        {mem.location || 'Moments of Us'}
                      </span>
                      <span className="rounded-full bg-black/60 border border-[#DFBF99]/30 px-2 py-0.5 text-[10px] font-mono text-[#DFBF99]">
                        {new Date(mem.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 px-1">
                    <h3 className="font-serif text-lg font-normal text-[#FAF7F2] truncate group-hover:text-[#EADFD5] transition-colors">
                      {mem.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-[#C9B7C3] mt-1 leading-relaxed font-normal">
                      {mem.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Ledger Statistics & Countdown Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mx-auto max-w-5xl rounded-2xl border border-[#DFBF99]/20 bg-[#1B0B1E]/85 p-6 shadow-xl backdrop-blur-xl mb-12"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#DFBF99]/15">
            {/* Memories */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div className="flex items-center gap-1.5 text-xs font-sans text-[#C9B7C3] mb-1">
                <Camera className="h-3.5 w-3.5 text-[#DFBF99]" />
                <span className="tracking-wide">Memories</span>
              </div>
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#FAF7F2]">{totalMemories}</span>
            </div>

            {/* Photos */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div className="flex items-center gap-1.5 text-xs font-sans text-[#C9B7C3] mb-1">
                <Sparkles className="h-3.5 w-3.5 text-[#DFBF99]" />
                <span className="tracking-wide">Photos</span>
              </div>
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#FAF7F2]">{totalPhotos}</span>
            </div>

            {/* Places */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div className="flex items-center gap-1.5 text-xs font-sans text-[#C9B7C3] mb-1">
                <MapPin className="h-3.5 w-3.5 text-[#DFBF99]" />
                <span className="tracking-wide">Places</span>
              </div>
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#FAF7F2]">{totalPlaces}</span>
            </div>

            {/* Letters */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <div className="flex items-center gap-1.5 text-xs font-sans text-[#C9B7C3] mb-1">
                <Mail className="h-3.5 w-3.5 text-[#DFBF99]" />
                <span className="tracking-wide">Letters</span>
              </div>
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#FAF7F2]">{totalLetters}</span>
            </div>

            {/* Upcoming Milestone */}
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-2 text-center pt-3 sm:pt-2">
              <div className="flex items-center gap-1.5 text-xs text-[#DFBF99] mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="truncate max-w-[130px] tracking-wide">{upcomingEvent.title}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl sm:text-4xl font-normal text-[#DFBF99]">
                  {getDaysUntil(upcomingEvent.targetDate)}
                </span>
                <span className="text-xs text-[#C9B7C3]">days left</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Emotionally Prominent "On This Day" Section */}
        {onThisDayMemory && (
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="mx-auto max-w-5xl"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#DFBF99]/25 bg-gradient-to-br from-[#270E2A]/95 via-[#1E0C22]/95 to-[#140817]/95 p-6 sm:p-9 shadow-2xl backdrop-blur-xl">
              {/* Decorative vintage ribbon accent */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-3.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/30 bg-[#2E1233]/80 px-3.5 py-1 text-xs text-[#DFBF99]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="tracking-wide font-sans font-medium">On This Day</span>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-[#7D2146]/50 border border-[#DFBF99]/25 px-3 py-1 text-xs text-[#FAF7F2] font-mono">
                      {getYearOffsetLabel(onThisDayMemory.date)}
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#FAF7F2] leading-snug">
                    {onThisDayMemory.title}
                  </h3>

                  <p className="text-sm text-[#D4C6CE] leading-relaxed line-clamp-3 font-normal">
                    {onThisDayMemory.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#C9B7C3] pt-1 font-sans">
                    <span className="font-mono text-[11px] text-[#DFBF99]">
                      {new Date(onThisDayMemory.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                    {onThisDayMemory.location && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#DFBF99]" />
                          {onThisDayMemory.location}
                        </span>
                      </>
                    )}
                    <span>&bull;</span>
                    <span className="text-[#FAF7F2]/80">Recorded by {onThisDayMemory.creatorName}</span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center sm:items-end gap-3.5">
                  {onThisDayMemory?.photos?.[0] && (
                    <div
                      id="on-this-day-photo"
                      onClick={() => onViewMemory(onThisDayMemory)}
                      className="group relative h-40 w-60 sm:h-44 sm:w-64 overflow-hidden rounded-xl border border-[#DFBF99]/30 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:border-[#DFBF99]/50"
                    >
                      <img
                        src={onThisDayMemory.photos[0]}
                        alt={onThisDayMemory.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-30 transition-opacity" />
                    </div>
                  )}

                  <button
                    id="on-this-day-read-btn"
                    onClick={() => onViewMemory(onThisDayMemory)}
                    className="flex items-center gap-2 rounded-full border border-[#DFBF99]/30 bg-[#250E28]/70 px-4 py-1.5 text-xs font-sans font-medium text-[#DFBF99] transition hover:text-[#FAF7F2] hover:bg-[#34133A] hover:border-[#DFBF99]/50 active:scale-95"
                  >
                    <span>Read Full Memory</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
