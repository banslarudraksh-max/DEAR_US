import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryCapsule } from '../../types';
import { 
  Box, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Lock, 
  Unlock, 
  Calendar, 
  Image as ImageIcon, 
  AlertTriangle, 
  X,
  FileText,
  Loader2
} from 'lucide-react';
import { MemoryImageUploader } from './MemoryImageUploader';
import { UploadPhotoItem, uploadCapsulePhotoToStorage } from '../../services/storageService';
import { AudioUploader } from '../common/AudioUploader';

interface AdminCapsulesProps {
  capsules: MemoryCapsule[];
  onSaveCapsule: (capsule: MemoryCapsule) => Promise<void>;
  onDeleteCapsule: (id: string) => Promise<void>;
  currentUser: string;
}

export const AdminCapsules: React.FC<AdminCapsulesProps> = ({
  capsules,
  onSaveCapsule,
  onDeleteCapsule,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCapsule, setEditingCapsule] = useState<Partial<MemoryCapsule> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [photoItems, setPhotoItems] = useState<UploadPhotoItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCapsules = capsules.filter((c) => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return true;
    return (
      Boolean(c.title && c.title.toLowerCase().includes(q)) ||
      Boolean(c.theme && c.theme.toLowerCase().includes(q)) ||
      Boolean(c.description && c.description.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setPhotoItems([]);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    setEditingCapsule({
      id: `cap-${Date.now()}`,
      title: '',
      theme: 'Anniversary Memories',
      description: '',
      unlockDate: nextYear.toISOString().split('T')[0],
      isSealed: true,
      mediaCount: 0,
      notesCount: 0,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cap: MemoryCapsule) => {
    setEditingCapsule({ ...cap });
    const existingUrls = (cap.photos && cap.photos.length > 0)
      ? cap.photos
      : (cap.coverImage ? [cap.coverImage] : []);

    if (existingUrls.length > 0) {
      setPhotoItems(
        existingUrls.map((url, idx) => ({
          id: `existing-cap-${cap.id}-${idx}`,
          previewUrl: url,
          url: url,
          storagePath: url,
          status: 'success',
          progress: 100,
          isExisting: true,
        }))
      );
    } else {
      setPhotoItems([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCapsule || !editingCapsule.title || !editingCapsule.unlockDate || isSaving) return;

    setIsSaving(true);
    try {
      const capsuleId = editingCapsule.id || `cap-${Date.now()}`;
      const finalPhotos: string[] = [];

      for (let i = 0; i < photoItems.length; i++) {
        const item = photoItems[i];
        if (item.file) {
          setPhotoItems((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, status: 'uploading', progress: 20 } : p))
          );
          const uploaded = await uploadCapsulePhotoToStorage(
            item.file,
            capsuleId,
            undefined,
            (percent) => {
              setPhotoItems((prev) =>
                prev.map((p, idx) => (idx === i ? { ...p, progress: percent } : p))
              );
            }
          );
          finalPhotos.push(uploaded.url);
        } else if (item.url || item.previewUrl) {
          finalPhotos.push(item.url || item.previewUrl);
        }
      }

      const finalCapsule: MemoryCapsule = {
        id: capsuleId,
        title: editingCapsule.title,
        theme: editingCapsule.theme || 'Treasured Vault',
        description: editingCapsule.description || '',
        createdDate: editingCapsule.createdDate || new Date().toISOString().split('T')[0],
        unlockDate: editingCapsule.unlockDate,
        creatorName: editingCapsule.creatorName || currentUser,
        creatorId: editingCapsule.creatorId || 'partner-1',
        photos: finalPhotos,
        coverImage: finalPhotos[0] || undefined,
        message: editingCapsule.message || editingCapsule.description || '',
        songTitle: editingCapsule.songTitle || undefined,
        songUrl: editingCapsule.songUrl || undefined,
        voiceNoteUrl: editingCapsule.songUrl || editingCapsule.voiceNoteUrl || undefined,
        isUnlocked: !editingCapsule.isSealed,
        isSealed: Boolean(editingCapsule.isSealed),
        mediaCount: finalPhotos.length,
        notesCount: editingCapsule.notesCount || 0,
        createdAt: editingCapsule.createdAt || new Date().toISOString(),
      };

      await onSaveCapsule(finalCapsule);
      setIsModalOpen(false);
      setEditingCapsule(null);
      setPhotoItems([]);
    } catch (err: any) {
      console.error('Failed saving memory capsule:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Memory Capsules
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Manage locked digital time capsules containing photos, audios, and secret notes.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>New Time Capsule</span>
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#18081B]/80 p-3 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/70" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search capsules by title, theme, or description..."
            className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
          />
        </div>
      </div>

      {/* Capsules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCapsules.map((cap) => (
          <div
            key={cap.id}
            className="rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 p-4 transition hover:border-[#DFBF99]/40 flex flex-col justify-between"
          >
            <div>
              {cap.coverImage ? (
                <div className="relative h-36 w-full rounded-lg overflow-hidden mb-3 border border-[#DFBF99]/15">
                  <img
                    src={cap.coverImage}
                    alt={cap.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-mono text-[#FAF7F2] backdrop-blur-md">
                    {cap.theme}
                  </span>
                </div>
              ) : (
                <div className="flex h-28 w-full items-center justify-center rounded-lg border border-[#DFBF99]/15 bg-[#250E28] text-[#DFBF99] mb-3">
                  <Box className="h-8 w-8" />
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="font-medium text-[#FAF7F2] text-sm truncate">
                  {cap.title}
                </h3>
                {cap.isSealed ? (
                  <span className="text-amber-300 text-[10px] font-mono flex items-center gap-1 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                    <Lock className="h-3 w-3" /> Sealed
                  </span>
                ) : (
                  <span className="text-emerald-300 text-[10px] font-mono flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                    <Unlock className="h-3 w-3" /> Unlocked
                  </span>
                )}
              </div>

              <p className="text-xs text-[#8F7D8A] font-sans line-clamp-2 mb-3">
                {cap.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#C9B7C3] pt-2 border-t border-[#DFBF99]/10">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3 text-[#DFBF99]" />
                  {cap.unlockDate}
                </span>
                <span className="text-[#8F7D8A]">
                  {cap.mediaCount || 0} items
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-[#DFBF99]/15">
              <button
                onClick={() => handleOpenEdit(cap)}
                className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                title="Edit Capsule"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteConfirmId(cap.id)}
                className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                title="Delete Capsule"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {isModalOpen && editingCapsule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 sm:p-8 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-6">
                <h3 className="editorial-title text-2xl text-[#FAF7F2] font-normal">
                  {editingCapsule.title ? 'Edit Capsule' : 'Create Time Capsule'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Capsule Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCapsule.title || ''}
                    onChange={(e) => setEditingCapsule({ ...editingCapsule, title: e.target.value })}
                    placeholder="e.g. Paris 2024 Hidden Polaroid Vault"
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Theme / Tag
                    </label>
                    <input
                      type="text"
                      value={editingCapsule.theme || ''}
                      onChange={(e) => setEditingCapsule({ ...editingCapsule, theme: e.target.value })}
                      placeholder="e.g. First Year Highlights"
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Unlock Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingCapsule.unlockDate || ''}
                      onChange={(e) => setEditingCapsule({ ...editingCapsule, unlockDate: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Description / Capsule Dedication
                  </label>
                  <textarea
                    rows={3}
                    value={editingCapsule.description || ''}
                    onChange={(e) => setEditingCapsule({ ...editingCapsule, description: e.target.value })}
                    placeholder="Why this capsule is sealed and what to remember when opened..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Capsule Photographs &amp; Keepsakes
                  </label>
                  <MemoryImageUploader
                    photos={photoItems}
                    onChange={setPhotoItems}
                    singleMode={false}
                    label="Capsule Photographs & Keepsakes"
                    subtitle="Add one or more photos from your device"
                    idPrefix="capsule"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Capsule Soundtrack / Preserved Voice Recording
                  </label>
                  <AudioUploader
                    songTitle={editingCapsule.songTitle || ''}
                    songUrl={editingCapsule.songUrl || editingCapsule.voiceNoteUrl || ''}
                    onSongTitleChange={(val) => setEditingCapsule({ ...editingCapsule, songTitle: val })}
                    onSongUrlChange={(val) => setEditingCapsule({ ...editingCapsule, songUrl: val, voiceNoteUrl: val })}
                    disabled={isSaving}
                    idPrefix="capsule-audio"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingCapsule.isSealed)}
                      onChange={(e) => setEditingCapsule({ ...editingCapsule, isSealed: e.target.checked })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    <span>Seal Capsule (Require unlock date or master admin override to view contents)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#DFBF99]" />}
                    <span>{isSaving ? 'Saving Capsule...' : 'Save Capsule'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#1D081F] p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/60 text-rose-400 border border-rose-700/40">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal mb-2">
                Delete Memory Capsule?
              </h3>
              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This will delete the capsule and its sealed records permanently.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="rounded-xl border border-[#DFBF99]/20 bg-[#280E2B] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#38143C] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onDeleteCapsule(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="rounded-xl border border-rose-500/50 bg-rose-700 px-5 py-2.5 text-xs font-medium text-white hover:bg-rose-600 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
