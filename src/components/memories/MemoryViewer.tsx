import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Memory, MemoryReaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { VoiceNotePlayer, UnifiedAudioPlayer } from '../common/AudioPlayer';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MapPin, 
  Calendar, 
  Music, 
  Sparkles, 
  Lock, 
  Edit3, 
  Trash2,
  Share2
} from 'lucide-react';

interface MemoryViewerProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (mem: Memory) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddReaction: (memoryId: string, reaction: MemoryReaction) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({
  memory,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddReaction,
  onNext,
  onPrev,
}) => {
  const { user } = useAuth();
  const [photoIndex, setPhotoIndex] = useState(0);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setPhotoIndex(0);
  }, [memory?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !memory) return null;

  const photos = memory.photos?.length > 0
    ? memory.photos
    : ['https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85'];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    
    // Swipe threshold 50px
    if (diff > 50) {
      if (photos.length > 1 && photoIndex > 0) {
        setPhotoIndex(photoIndex - 1);
      } else if (onPrev) {
        onPrev();
      }
    } else if (diff < -50) {
      if (photos.length > 1 && photoIndex < photos.length - 1) {
        setPhotoIndex(photoIndex + 1);
      } else if (onNext) {
        onNext();
      }
    }
    touchStartX.current = null;
  };

  const availableReactions = [
    { emoji: '✨', label: 'Magical' },
    { emoji: '🥂', label: 'Toast' },
    { emoji: '💌', label: 'Cherished' },
    { emoji: '🌿', label: 'Serene' },
    { emoji: '☕', label: 'Warmth' },
  ];

  const handleAddReactionClick = (emoji: string, label: string) => {
    const newReaction: MemoryReaction = {
      id: `rx-${Date.now()}`,
      emoji,
      label,
      userName: user?.name || 'Partner',
      createdAt: new Date().toISOString(),
    };
    onAddReaction(memory.id, newReaction);
  };

  return (
    <div
      id="memory-viewer-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-6 backdrop-blur-2xl transition-opacity duration-300"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col lg:flex-row h-full max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-[#DFBF99]/25 bg-[#140816] shadow-2xl shadow-black/95"
      >
        {/* Close Button */}
        <button
          id="close-viewer-btn"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-[#140816]/80 text-[#DFBF99] border border-[#DFBF99]/30 backdrop-blur-md transition hover:bg-[#7D2146] hover:text-white active:scale-95"
          title="Close (Esc)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Global Previous Memory Navigation on Desktop */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="hidden xl:flex absolute -left-14 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full bg-[#1B0B1E]/80 border border-[#DFBF99]/30 text-[#DFBF99] hover:bg-[#7D2146] hover:text-white transition"
            title="Previous Memory"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Global Next Memory Navigation on Desktop */}
        {onNext && (
          <button
            onClick={onNext}
            className="hidden xl:flex absolute -right-14 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full bg-[#1B0B1E]/80 border border-[#DFBF99]/30 text-[#DFBF99] hover:bg-[#7D2146] hover:text-white transition"
            title="Next Memory"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Left Side: Cinematic Large Photo Gallery with Swipe Handler */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 bg-black/95 flex flex-col justify-center items-center overflow-hidden min-h-[320px] lg:min-h-full"
        >
          <img
            key={photoIndex}
            src={photos[photoIndex]}
            alt={memory.title}
            className="h-full w-full object-contain transition-opacity duration-300 select-none animate-fade-in"
          />

          {/* Carousel Arrows */}
          {photos.length > 1 && (
            <>
              <button
                id="viewer-prev-photo-btn"
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#140816]/75 text-[#DFBF99] border border-[#DFBF99]/25 backdrop-blur-md transition hover:bg-[#7D2146] hover:text-white"
                title="Previous Photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                id="viewer-next-photo-btn"
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#140816]/75 text-[#DFBF99] border border-[#DFBF99]/25 backdrop-blur-md transition hover:bg-[#7D2146] hover:text-white"
                title="Next Photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Photo Dots indicator */}
              <div className="absolute bottom-4 flex items-center gap-1.5 rounded-full bg-[#140816]/75 px-3 py-1 backdrop-blur-md border border-[#DFBF99]/20">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPhotoIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === photoIndex ? 'w-5 bg-[#DFBF99]' : 'w-1.5 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Editorial Narrative & Details */}
        <div className="w-full lg:w-[460px] flex flex-col justify-between overflow-y-auto border-t lg:border-t-0 lg:border-l border-[#DFBF99]/18 bg-[#17091A] p-6 sm:p-8">
          <div>
            {/* Header badges: Mood, Category, Privacy */}
            <div className="flex flex-wrap items-center gap-2 mb-4 font-sans">
              <span className="rounded-full border border-[#DFBF99]/30 bg-[#250E28]/80 px-3 py-1 text-xs font-medium text-[#DFBF99] uppercase tracking-wider">
                {memory.mood}
              </span>
              <span className="rounded-full bg-[#250E28]/60 border border-[#DFBF99]/15 px-3 py-1 text-xs font-medium text-[#C9B7C3]">
                {memory.category}
              </span>
              {memory.isPrivate && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-800/40 bg-amber-950/30 px-2.5 py-1 text-xs text-amber-200">
                  <Lock className="h-3 w-3" />
                  <span>Private</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="editorial-title text-3xl sm:text-4xl font-normal text-[#FAF7F2] mb-3 leading-snug">
              {memory.title}
            </h2>

            {/* Meta Row: Date, Location, Author */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#C9B7C3] mb-6 font-sans">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#DFBF99]" />
                <span className="text-[#FAF7F2] font-mono text-[11px]">
                  {new Date(memory.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
              </div>
              {memory.location && (
                <>
                  <span className="text-[#DFBF99]/40">&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#DFBF99]" />
                    <span>{memory.location}</span>
                  </div>
                </>
              )}
              <span className="text-[#DFBF99]/40">&bull;</span>
              <span className="text-[#DFBF99]/80">Recorded by {memory.creatorName}</span>
            </div>

            {/* Narrative Story */}
            <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[#FAF7F2]/90 space-y-3 font-sans mb-6">
              <p className="whitespace-pre-line leading-relaxed font-normal">{memory.description}</p>
            </div>

            {/* Connected Soundtrack */}
            {(memory.songUrl || memory.songTitle) && (
              <div className="mb-6">
                <UnifiedAudioPlayer
                  url={memory.songUrl}
                  title={memory.songTitle || 'Memory Soundtrack'}
                  subtitle="Memory Soundtrack"
                  idPrefix={`memory-viewer-${memory.id}`}
                />
              </div>
            )}

            {/* Voice Note if present */}
            {memory.voiceNoteUrl && (
              <div className="mb-6">
                <VoiceNotePlayer url={memory.voiceNoteUrl} label="Whispered Audio Note" />
              </div>
            )}

            {/* Tags */}
            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6 font-sans">
                {memory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#250E28]/60 border border-[#DFBF99]/15 px-2.5 py-0.5 text-xs text-[#C9B7C3]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reactions Strip */}
            <div className="border-t border-[#DFBF99]/15 pt-4 mb-4 font-sans">
              <span className="text-xs text-[#DFBF99] font-medium block mb-2 uppercase tracking-wider">Partner Reactions</span>
              <div className="flex flex-wrap items-center gap-2">
                {availableReactions.map((rx) => {
                  const count = memory.reactions?.filter((r) => r.emoji === rx.emoji).length || 0;
                  return (
                    <button
                      key={rx.emoji}
                      onClick={() => handleAddReactionClick(rx.emoji, rx.label)}
                      className="flex items-center gap-1.5 rounded-full border border-[#DFBF99]/20 bg-[#250E28]/50 px-3 py-1.5 text-xs text-[#FAF7F2] transition hover:border-[#DFBF99]/50 hover:bg-[#2F1133] active:scale-95"
                    >
                      <span>{rx.emoji}</span>
                      <span className="text-[11px] text-[#C9B7C3]">{rx.label}</span>
                      {count > 0 && (
                        <span className="ml-0.5 rounded-full bg-[#7D2146] border border-[#DFBF99]/30 px-1.5 py-0.2 text-[10px] font-semibold text-[#FAF7F2]">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between border-t border-[#DFBF99]/15 pt-4 font-sans">
            <button
              id="viewer-fav-btn"
              onClick={() => onToggleFavorite(memory.id)}
              className={`flex items-center gap-1.5 text-xs font-medium transition ${
                memory.isFavorite ? 'text-[#DFBF99]' : 'text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              <Heart className={`h-4 w-4 ${memory.isFavorite ? 'fill-current text-[#DFBF99]' : ''}`} />
              <span>{memory.isFavorite ? 'Cherished Forever' : 'Mark as Cherished'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                id="viewer-edit-btn"
                onClick={() => {
                  onClose();
                  onEdit(memory);
                }}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#C9B7C3] hover:bg-[#250E28] hover:text-[#FAF7F2] transition"
                title="Edit Memory"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                id="viewer-delete-btn"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this memory?')) {
                    onDelete(memory.id);
                    onClose();
                  }
                }}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#C9B7C3] hover:bg-[#250E28] hover:text-red-400 transition"
                title="Delete Memory"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
