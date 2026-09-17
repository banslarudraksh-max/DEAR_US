import React, { useState } from 'react';
import { FutureLetter } from '../../types';
import { LetterModal } from './LetterModal';
import { UnifiedAudioPlayer } from '../common/AudioPlayer';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Unlock, 
  Calendar, 
  Plus, 
  Heart, 
  Clock, 
  X, 
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface LettersSectionProps {
  letters: FutureLetter[];
  onSaveLetter: (letter: FutureLetter) => void;
  onDeleteLetter: (id: string) => void;
}

export const LettersSection: React.FC<LettersSectionProps> = ({
  letters = [],
  onSaveLetter,
  onDeleteLetter,
}) => {
  const safeLetters = letters || [];
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<FutureLetter | null>(null);

  const isUnlockable = (letter: FutureLetter) => {
    const today = new Date().toISOString().split('T')[0];
    return letter.unlockDate <= today || letter.isOpened;
  };

  const getDaysLeft = (unlockDateStr: string) => {
    const unlock = new Date(unlockDateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((unlock - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleOpenLetter = (letter: FutureLetter) => {
    if (!letter.isOpened && isUnlockable(letter)) {
      // Trigger subtle celebration
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#E2829C', '#F8B4C4', '#8B264E'],
      });
      const updated = { ...letter, isOpened: true };
      onSaveLetter(updated);
      setSelectedLetter(updated);
    } else {
      setSelectedLetter(letter);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-[#DFBF99]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-2.5">
            <Mail className="h-3.5 w-3.5" />
            <span className="font-sans font-medium tracking-wide">Epistles for Tomorrow</span>
          </div>
          <h1 className="editorial-title text-4xl sm:text-5xl font-normal text-[#FAF7F2]">
            Future Letters & Sealed Envelopes
          </h1>
          <p className="text-sm text-[#C9B7C3] mt-2 max-w-lg leading-relaxed font-sans">
            Words penned with devotion today, sealed until the exact sunrise they were destined to be opened.
          </p>
        </div>

        <button
          id="write-future-letter-btn"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2.5 text-xs font-sans font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Write a Letter</span>
        </button>
      </div>

      {/* Grid of Envelopes or Empty State */}
      {safeLetters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeLetters.map((letter) => {
            const ready = isUnlockable(letter);
            const daysLeft = getDaysLeft(letter.unlockDate);

            return (
              <div
                key={letter.id}
                id={`letter-card-${letter.id}`}
                onClick={() => handleOpenLetter(letter)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#DFBF99]/18 bg-gradient-to-b from-[#240E2A] to-[#150818] p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#DFBF99]/40 hover:shadow-2xl"
              >
                {/* Envelope flap aesthetic representation */}
                <div className="relative mb-5 flex flex-col items-center">
                  <div
                    className="w-full h-24 rounded-xl border border-[#DFBF99]/20 relative overflow-hidden flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: letter.sealColor || '#361138' }}
                  >
                    {/* Flap lines */}
                    <div className="absolute inset-0 border-b border-[#DFBF99]/25 transform -skew-y-2" />
                    
                    {/* Wax Seal Medallion */}
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#DFBF99]/50 bg-[#7D2146] shadow-xl ring-2 ring-black/50">
                      {ready ? (
                        <Unlock className="h-5 w-5 text-[#DFBF99]" />
                      ) : (
                        <Lock className="h-5 w-5 text-[#DFBF99]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Letter Header */}
                <div className="flex items-center justify-between text-xs text-[#DFBF99]/90 mb-2 font-mono">
                  <span className="text-[11px]">
                    From: {letter.senderName}
                  </span>
                  <span className="text-[11px]">
                    For: {letter.recipientName}
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-normal text-[#FAF7F2] mb-2 group-hover:text-[#EADFD5] transition">
                  {letter.title}
                </h3>

                {/* Status / Countdown */}
                <div className="mt-4 pt-4 border-t border-[#DFBF99]/15 flex items-center justify-between text-xs font-sans">
                  {ready ? (
                    <div className="flex items-center gap-1.5 text-[#DFBF99] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Ready to Unseal</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#DFBF99]/85 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Unlocks in {daysLeft} days ({new Date(letter.unlockDate).toLocaleDateString(undefined, { dateStyle: 'medium' })})</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this letter?')) onDeleteLetter(letter.id);
                    }}
                    className="rounded-full p-1 text-[#DFBF99]/60 hover:text-red-400 hover:bg-[#34133A]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DFBF99]/30 bg-[#1B0B1E]/60 p-12 sm:p-16 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7D2146]/40 border border-[#DFBF99]/30 text-[#DFBF99]">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-3xl font-normal text-[#FAF7F2] mb-2">No letters yet.</h3>
          <p className="font-serif italic text-lg text-[#DFBF99] mb-3">
            &ldquo;Words penned today become the treasures of tomorrow.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-[#C9B7C3] max-w-md mx-auto mb-6 leading-relaxed font-sans">
            Pen an epistle to be preserved in an encrypted envelope, locked until a future birthday, anniversary, or surprise sunrise.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/40 bg-[#7D2146] px-6 py-2.5 text-xs font-sans font-medium text-[#FAF7F2] shadow-md hover:bg-[#8B264E] transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 text-[#DFBF99]" />
            <span>Write First Letter</span>
          </button>
        </div>
      )}

      {/* Full Letter Reader Modal - Warm Ivory Parchment */}
      {selectedLetter && (
        <div
          onClick={() => setSelectedLetter(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-8 w-full max-w-xl rounded-2xl border border-[#DFBF99]/40 bg-[#FAF7F2] text-[#260D28] p-8 sm:p-12 shadow-2xl animate-fade-in"
          >
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-[#4E173E] hover:bg-[#ECE4DC] transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* If still locked and user forced inspection */}
            {!isUnlockable(selectedLetter) ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#7D2146] text-[#DFBF99] shadow-lg mb-4">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-3xl font-normal text-[#2E0E2E] mb-2">
                  This Epistle is Still Sealed
                </h3>
                <p className="text-sm text-[#6C5669] max-w-md mx-auto mb-6 font-sans">
                  {selectedLetter.senderName} prepared this letter with love to be unlocked on{' '}
                  <strong className="text-[#3B1238]">
                    {new Date(selectedLetter.unlockDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </strong>
                  .
                </p>
                <div className="rounded-xl border border-[#DFBF99]/40 bg-[#F3ECE2] p-4 text-xs text-[#5C4258] italic max-w-xs mx-auto mb-6 font-serif">
                  &ldquo;Patience makes love sweeter.&rdquo;
                </div>
                <button
                  onClick={() => {
                    // Allow test force-unlock
                    const updated = { ...selectedLetter, isOpened: true };
                    onSaveLetter(updated);
                    setSelectedLetter(updated);
                  }}
                  className="text-xs font-sans text-[#7D2146] underline hover:text-[#3B1238]"
                >
                  (Demo Preview: Unseal Anyway)
                </button>
              </div>
            ) : (
              /* Opened letter parchment reading view */
              <div>
                <div className="border-b border-[#DFBF99]/30 pb-4 mb-6 flex items-center justify-between text-xs text-[#6C5669] font-sans">
                  <span>Written on {new Date(selectedLetter.createdDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                  <span>Unlocked {new Date(selectedLetter.unlockDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>

                <div className="text-center mb-8">
                  <div className="mx-auto mb-3 h-10 w-10 flex items-center justify-center rounded-full bg-[#7D2146] text-[#DFBF99] shadow-sm">
                    <Heart className="h-5 w-5 fill-current" />
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#260D28]">
                    {selectedLetter.title}
                  </h2>
                  <p className="font-serif italic text-base text-[#6C5669] mt-1">
                    To my dearest {selectedLetter.recipientName}
                  </p>
                </div>

                {/* Letter Message Body with editorial serif typography */}
                <div className="font-serif text-lg sm:text-xl leading-relaxed text-[#260D28] space-y-4 mb-8 whitespace-pre-line italic">
                  {selectedLetter.message}
                </div>

                {/* Enclosed Photo if present */}
                {selectedLetter.photoUrl && (
                  <div className="mb-8 rounded-xl overflow-hidden border-4 border-[#FAF7F2] shadow-lg">
                    <img
                      src={selectedLetter.photoUrl}
                      alt="Enclosed secret photo"
                      className="w-full object-cover max-h-80"
                    />
                  </div>
                )}

                {/* Enclosed Audio / Song if present */}
                {(selectedLetter.songUrl || selectedLetter.voiceNoteUrl) && (
                  <div className="mb-8">
                    <UnifiedAudioPlayer
                      url={selectedLetter.songUrl || selectedLetter.voiceNoteUrl}
                      title={selectedLetter.songTitle || 'Whispered Voice Note'}
                      subtitle="Letter Recording"
                      idPrefix={`letter-viewer-${selectedLetter.id}`}
                    />
                  </div>
                )}

                <div className="text-right pt-4 border-t border-[#DFBF99]/30">
                  <p className="font-serif italic text-base text-[#6C5669]">Forever yours,</p>
                  <p className="font-serif font-medium text-2xl text-[#260D28] mt-0.5">{selectedLetter.senderName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <LetterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveLetter}
      />
    </div>
  );
};
