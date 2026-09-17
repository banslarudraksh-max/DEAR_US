import React from 'react';
import { motion } from 'motion/react';
import { Memory, MemoryMood } from '../../types';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Lock, 
  Music, 
  Mic, 
  Sparkles, 
  Compass, 
  Smile, 
  Feather, 
  PartyPopper,
  Wine
} from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
  onClick: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onClick, onToggleFavorite }) => {
  const getMoodIcon = (mood: MemoryMood) => {
    switch (mood) {
      case 'Love':
        return <Heart className="h-3 w-3 fill-current text-[#DFBF99]" />;
      case 'Peaceful':
        return <Feather className="h-3 w-3 text-[#EADFD5]" />;
      case 'Magical':
        return <Sparkles className="h-3 w-3 text-[#DFBF99]" />;
      case 'Emotional':
        return <Wine className="h-3 w-3 text-[#D8899E]" />;
      case 'Adventure':
        return <Compass className="h-3 w-3 text-[#DFBF99]" />;
      case 'Celebration':
        return <PartyPopper className="h-3 w-3 text-[#EED7B8]" />;
      case 'Funny':
        return <Smile className="h-3 w-3 text-[#C9B7C3]" />;
      default:
        return <Sparkles className="h-3 w-3 text-[#DFBF99]" />;
    }
  };

  const coverPhoto = memory.photos?.[0] || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      id={`memory-card-${memory.id}`}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#DFBF99]/18 bg-[#1B0B1E]/85 p-3.5 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[#DFBF99]/40 hover:bg-[#260E2A] hover:shadow-2xl"
    >
      {/* Photo Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#280E2A]">
        <img
          src={coverPhoto}
          alt={memory.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />

        {/* Badges on Photo */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {/* Mood Badge */}
          <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-sans font-medium text-[#FAF7F2] backdrop-blur-md border border-[#DFBF99]/25 shadow-sm">
            {getMoodIcon(memory.mood)}
            <span className="text-[10px] tracking-wide">{memory.mood}</span>
          </span>

          {/* Privacy Badge */}
          {memory.isPrivate && (
            <span className="flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-sans text-[#DFBF99] backdrop-blur-md border border-[#DFBF99]/30">
              <Lock className="h-2.5 w-2.5" />
              <span>Private</span>
            </span>
          )}
        </div>

        {/* Favorite Button with pop effect */}
        <button
          id={`fav-btn-${memory.id}`}
          onClick={(e) => onToggleFavorite(memory.id, e)}
          className={`absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 backdrop-blur-md border transition-all duration-200 hover:scale-110 active:scale-90 ${
            memory.isFavorite 
              ? 'text-[#DFBF99] border-[#DFBF99]/50 bg-black/70' 
              : 'text-white/70 hover:text-white border-white/10'
          }`}
          title={memory.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
        >
          <Heart className={`h-3.5 w-3.5 transition-transform duration-300 ${memory.isFavorite ? 'fill-current scale-110' : ''}`} />
        </button>

        {/* Bottom meta over image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-[#FAF7F2] z-10">
          {memory.location ? (
            <span className="flex items-center gap-1 font-serif italic truncate max-w-[170px] text-[#FAF7F2]">
              <MapPin className="h-3 w-3 text-[#DFBF99]/85 shrink-0" />
              <span className="truncate">{memory.location}</span>
            </span>
          ) : (
            <span className="font-serif italic text-[#FAF7F2]/80">Moments of Us</span>
          )}
          <span className="text-[10px] bg-black/55 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-xs font-mono text-[#DFBF99]">
            {new Date(memory.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="pt-3 px-1">
        <div className="flex items-center justify-between text-[10px] text-[#A896A4] mb-1.5 font-sans">
          <span className="uppercase tracking-[0.14em] font-medium text-[#DFBF99]/90">{memory.category}</span>
          <div className="flex items-center gap-1.5">
            {memory.songTitle && (
              <span title={`Soundtrack: ${memory.songTitle}`}>
                <Music className="h-3 w-3 text-[#DFBF99]" />
              </span>
            )}
            {memory.voiceNoteUrl && (
              <span title="Includes Voice Recording">
                <Mic className="h-3 w-3 text-[#DFBF99]" />
              </span>
            )}
            {memory.reactions && memory.reactions.length > 0 && (
              <span className="text-[11px]">{memory.reactions[0].emoji}</span>
            )}
          </div>
        </div>

        <h3 className="font-serif text-lg font-normal text-[#FAF7F2] truncate group-hover:text-[#EADFD5] transition-colors">
          {memory.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs text-[#C9B7C3] leading-relaxed font-normal">
          {memory.description}
        </p>

        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {memory.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#290E2D]/80 border border-[#DFBF99]/15 px-2.5 py-0.5 text-[9px] font-sans text-[#DFBF99]/85"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
