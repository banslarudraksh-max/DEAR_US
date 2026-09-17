import React, { useState } from 'react';
import { MemoryCapsule } from '../../types';
import { CapsuleModal } from './CapsuleModal';
import { UnifiedAudioPlayer } from '../common/AudioPlayer';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Lock, 
  Unlock, 
  Calendar, 
  Plus, 
  Clock, 
  FileText, 
  Image, 
  Link2, 
  X, 
  Trash2,
  CheckCircle2,
  Box,
  Music
} from 'lucide-react';

interface CapsulesSectionProps {
  capsules: MemoryCapsule[];
  onSaveCapsule: (capsule: MemoryCapsule) => void;
  onDeleteCapsule: (id: string) => void;
}

export const CapsulesSection: React.FC<CapsulesSectionProps> = ({
  capsules = [],
  onSaveCapsule,
  onDeleteCapsule,
}) => {
  const safeCapsules = capsules || [];
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<MemoryCapsule | null>(null);

  const isUnlockable = (capsule: MemoryCapsule) => {
    const today = new Date().toISOString().split('T')[0];
    return capsule.unlockDate <= today || capsule.isUnlocked;
  };

  const getDaysLeft = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleOpenCapsule = (cap: MemoryCapsule) => {
    if (!cap.isUnlocked && isUnlockable(cap)) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E2829C', '#8B264E', '#FAF4F7'],
      });
      const updated = { ...cap, isUnlocked: true };
      onSaveCapsule(updated);
      setSelectedCapsule(updated);
    } else {
      setSelectedCapsule(cap);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-[#DFBF99]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-2.5">
            <Box className="h-3.5 w-3.5" />
            <span className="font-sans font-medium tracking-wide">Temporal Vessels</span>
          </div>
          <h1 className="editorial-title text-4xl sm:text-5xl font-normal text-[#FAF7F2]">
            Memory Capsules
          </h1>
          <p className="text-sm text-[#C9B7C3] mt-2 max-w-lg leading-relaxed font-sans">
            Sealed vaults of messages, photographs, and tokens locked away for future anniversaries.
          </p>
        </div>

        <button
          id="seal-new-capsule-btn"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2.5 text-xs font-sans font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Seal a Capsule</span>
        </button>
      </div>

      {/* Grid of Capsules or Empty State */}
      {safeCapsules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeCapsules.map((cap) => {
            const ready = isUnlockable(cap);
            const daysLeft = getDaysLeft(cap.unlockDate);

            return (
              <div
                key={cap.id}
                id={`capsule-card-${cap.id}`}
                onClick={() => handleOpenCapsule(cap)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#DFBF99]/18 bg-gradient-to-br from-[#240E2A]/90 via-[#1B0B1E]/90 to-[#140817]/90 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#DFBF99]/40 hover:shadow-2xl"
              >
                {/* Vault Dial / Lock Graphic */}
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-full bg-[#2F1133] border border-[#DFBF99]/20 px-3 py-0.5 text-[10px] font-sans font-medium text-[#DFBF99] tracking-wider uppercase">
                    {cap.theme}
                  </span>

                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                        ready
                          ? 'border-[#DFBF99]/50 bg-[#28112C] text-[#DFBF99]'
                          : 'border-[#DFBF99]/25 bg-[#250E28] text-[#DFBF99]'
                      }`}
                    >
                      {ready ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this memory capsule?')) onDeleteCapsule(cap.id);
                      }}
                      className="p-1 text-[#DFBF99]/50 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif text-2xl font-normal text-[#FAF7F2] mb-2 group-hover:text-[#EADFD5] transition">
                  {cap.title}
                </h3>

                <p className="text-xs text-[#C9B7C3] mb-6 line-clamp-2 leading-relaxed font-normal">
                  {cap.message}
                </p>

                {/* Contents Badges */}
                <div className="flex items-center gap-3 text-xs text-[#A896A4] mb-6 font-sans">
                  <span className="flex items-center gap-1">
                    <Image className="h-3.5 w-3.5 text-[#DFBF99]" />
                    <span>{cap.photos?.length || 0} photos</span>
                  </span>
                  {cap.notes && cap.notes.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-[#DFBF99]" />
                      <span>{cap.notes.length} notes</span>
                    </span>
                  )}
                </div>

                {/* Bottom Unlock Countdown Bar */}
                <div className="pt-4 border-t border-[#DFBF99]/15 flex items-center justify-between text-xs font-sans">
                  {ready ? (
                    <span className="flex items-center gap-1.5 text-[#DFBF99] font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Unlocked & Ready to View</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[#DFBF99]/85 font-medium">
                      <Clock className="h-4 w-4" />
                      <span>{daysLeft} days until unlock</span>
                    </span>
                  )}
                  <span className="text-[11px] text-[#A896A4] font-mono">
                    {new Date(cap.unlockDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DFBF99]/30 bg-[#1B0B1E]/60 p-12 sm:p-16 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7D2146]/40 border border-[#DFBF99]/30 text-[#DFBF99]">
            <Box className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-3xl font-normal text-[#FAF7F2] mb-2">No memory capsules sealed yet.</h3>
          <p className="font-serif italic text-lg text-[#DFBF99] mb-3">
            &ldquo;Moments preserved in time, waiting for tomorrow&apos;s reunion.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-[#C9B7C3] max-w-md mx-auto mb-6 leading-relaxed font-sans">
            Seal a digital vessel containing voice messages, shared photos, and promises that cannot be opened until a chosen anniversary.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/40 bg-[#7D2146] px-6 py-2.5 text-xs font-sans font-medium text-[#FAF7F2] shadow-md hover:bg-[#8B264E] transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 text-[#DFBF99]" />
            <span>Seal First Capsule</span>
          </button>
        </div>
      )}

      {/* Capsule Content Modal */}
      {selectedCapsule && (
        <div
          onClick={() => setSelectedCapsule(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-8 w-full max-w-2xl rounded-2xl border border-[#DFBF99]/30 bg-[#190A1C] p-6 sm:p-10 shadow-2xl text-[#FAF7F2]"
          >
            <button
              onClick={() => setSelectedCapsule(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-[#DFBF99] hover:text-[#FAF7F2] hover:bg-[#2F1133] transition"
            >
              <X className="h-5 w-5" />
            </button>

            {!isUnlockable(selectedCapsule) ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2F1133] border border-[#DFBF99]/30 text-[#DFBF99] shadow-lg mb-4">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-3xl font-normal text-[#FAF7F2] mb-2">
                  Capsule is Sealed
                </h3>
                <p className="text-sm text-[#C9B7C3] max-w-md mx-auto mb-6 font-sans">
                  Sealed by {selectedCapsule.creatorName} on{' '}
                  {new Date(selectedCapsule.createdDate).toLocaleDateString(undefined, { dateStyle: 'long' })}.
                  Scheduled to unlock on{' '}
                  <strong className="text-[#DFBF99]">
                    {new Date(selectedCapsule.unlockDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </strong>
                  .
                </p>
                <button
                  onClick={() => {
                    const updated = { ...selectedCapsule, isUnlocked: true };
                    onSaveCapsule(updated);
                    setSelectedCapsule(updated);
                  }}
                  className="text-xs font-sans text-[#DFBF99] underline hover:text-[#FAF7F2]"
                >
                  (Demo Preview: Unlock Capsule Now)
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2 font-sans">
                  <span className="rounded-full bg-[#7D2146] border border-[#DFBF99]/30 px-3 py-0.5 text-xs text-[#FAF7F2]">
                    {selectedCapsule.theme}
                  </span>
                  <span className="text-xs text-[#A896A4]">
                    Sealed {new Date(selectedCapsule.createdDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#FAF7F2] mb-4">
                  {selectedCapsule.title}
                </h2>

                <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 p-5 mb-6">
                  <span className="text-[11px] uppercase tracking-wider text-[#DFBF99] font-medium block mb-1.5 font-sans">
                    Revealed Message
                  </span>
                  <p className="font-serif text-base leading-relaxed text-[#EADFD5] whitespace-pre-line italic">
                    &ldquo;{selectedCapsule.message}&rdquo;
                  </p>
                </div>

                {/* Enclosed Voice Message or Soundtrack */}
                {(selectedCapsule.voiceNoteUrl || selectedCapsule.songUrl) && (
                  <div className="mb-6">
                    <UnifiedAudioPlayer
                      url={selectedCapsule.voiceNoteUrl || selectedCapsule.songUrl}
                      title={selectedCapsule.songTitle || 'Preserved Voice Recording'}
                      subtitle="Capsule Audio"
                      idPrefix={`capsule-viewer-${selectedCapsule.id}`}
                    />
                  </div>
                )}

                {/* Artifact Notes */}
                {selectedCapsule.notes && selectedCapsule.notes.length > 0 && (
                  <div className="mb-6">
                    <span className="text-xs text-[#FAF7F2] font-medium block mb-2 font-sans">Preserved Artifacts & Notes</span>
                    <ul className="space-y-2">
                      {selectedCapsule.notes.map((note, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 rounded-lg bg-[#250E28]/50 border border-[#DFBF99]/15 px-3.5 py-2 text-xs text-[#C9B7C3]"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-[#DFBF99]" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Photos */}
                {selectedCapsule.photos && selectedCapsule.photos.length > 0 && (
                  <div>
                    <span className="text-xs text-[#FAF7F2] font-medium block mb-2 font-sans">Enclosed Photos</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedCapsule.photos.map((photo, pIdx) => (
                        <div key={pIdx} className="overflow-hidden rounded-xl bg-[#280E2A] aspect-[4/3] border border-white/10">
                          <img src={photo} alt="Capsule artifact" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <CapsuleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveCapsule}
      />
    </div>
  );
};
