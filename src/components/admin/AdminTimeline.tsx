import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TimelineEvent, CategoryItem } from '../../types';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  MapPin, 
  Image as ImageIcon, 
  MoveUp, 
  MoveDown, 
  X, 
  AlertTriangle,
  Sparkles,
  Bookmark,
  Loader2
} from 'lucide-react';
import { MemoryImageUploader } from './MemoryImageUploader';
import { UploadPhotoItem, uploadTimelinePhotoToStorage } from '../../services/storageService';
import { AudioUploader } from '../common/AudioUploader';

interface AdminTimelineProps {
  timeline?: TimelineEvent[];
  events?: TimelineEvent[];
  categories: CategoryItem[];
  onSaveTimelineEvent?: (event: TimelineEvent) => Promise<void>;
  onSaveEvent?: (event: TimelineEvent) => Promise<void>;
  onDeleteTimelineEvent?: (id: string) => Promise<void>;
  onDeleteEvent?: (id: string) => Promise<void>;
  onReorderTimeline?: (events: TimelineEvent[]) => Promise<void>;
  currentUser: string;
}

export const AdminTimeline: React.FC<AdminTimelineProps> = ({
  timeline: timelineProp,
  events: eventsProp,
  categories,
  onSaveTimelineEvent,
  onSaveEvent,
  onDeleteTimelineEvent,
  onDeleteEvent,
  onReorderTimeline,
  currentUser,
}) => {
  const timeline = eventsProp || timelineProp || [];
  const dispatchSave = onSaveEvent || onSaveTimelineEvent || (async () => {});
  const dispatchDelete = onDeleteEvent || onDeleteTimelineEvent || (async () => {});
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<TimelineEvent> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [photoItems, setPhotoItems] = useState<UploadPhotoItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const filteredTimeline = timeline.filter((t) => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return true;
    return (
      Boolean(t.title && t.title.toLowerCase().includes(q)) ||
      Boolean(t.description && t.description.toLowerCase().includes(q)) ||
      Boolean(t.location && t.location.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setPhotoItems([]);
    setEditingEvent({
      id: `tl-${Date.now()}`,
      userId: currentUser,
      title: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: categories[0]?.name || 'Special',
      isMilestone: true,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: TimelineEvent) => {
    setEditingEvent({ ...event });
    const existingUrls = (event.photos && event.photos.length > 0)
      ? event.photos
      : (event.photoUrl ? [event.photoUrl] : []);

    if (existingUrls.length > 0) {
      setPhotoItems(
        existingUrls.map((url, idx) => ({
          id: `existing-tl-${event.id}-${idx}`,
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
    if (!editingEvent || !editingEvent.title || !editingEvent.date || isSaving) return;

    setIsSaving(true);
    try {
      const eventId = editingEvent.id || `tl-${Date.now()}`;
      const finalPhotos: string[] = [];

      for (let i = 0; i < photoItems.length; i++) {
        const item = photoItems[i];
        if (item.file) {
          setPhotoItems((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, status: 'uploading', progress: 20 } : p))
          );
          const uploaded = await uploadTimelinePhotoToStorage(
            item.file,
            eventId,
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

      const finalEvent: TimelineEvent = {
        id: eventId,
        userId: editingEvent.userId || currentUser,
        title: editingEvent.title,
        date: editingEvent.date,
        description: editingEvent.description || '',
        category: editingEvent.category || 'Special',
        photoUrl: finalPhotos[0] || undefined,
        photos: finalPhotos,
        tags: editingEvent.tags || [],
        location: editingEvent.location,
        songTitle: editingEvent.songTitle || undefined,
        songUrl: editingEvent.songUrl || undefined,
        voiceNoteUrl: editingEvent.songUrl || editingEvent.voiceNoteUrl || undefined,
        isMilestone: Boolean(editingEvent.isMilestone),
        createdAt: editingEvent.createdAt || new Date().toISOString(),
      };

      await dispatchSave(finalEvent);
      setIsModalOpen(false);
      setEditingEvent(null);
      setPhotoItems([]);
    } catch (err: any) {
      console.error('Failed saving milestone event:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const list = [...timeline];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    if (onReorderTimeline) {
      await onReorderTimeline(list);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Our Story &amp; Timeline Milestones
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Organize relationship milestones and chronological events displayed in the timeline and interactive journey.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>New Milestone</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#18081B]/80 p-3 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/70" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search milestones by title, story, or location..."
            className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
          />
        </div>
      </div>

      {/* Timeline Events List */}
      <div className="space-y-3">
        {filteredTimeline.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#DFBF99]/18 bg-[#160618]/90 p-4 transition hover:border-[#DFBF99]/40"
          >
            <div className="flex items-start gap-4 min-w-0">
              {item.photoUrl ? (
                <img
                  src={item.photoUrl}
                  alt={item.title}
                  className="h-14 w-14 rounded-lg object-cover border border-[#DFBF99]/20 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#DFBF99]/15 bg-[#250E28] text-[#DFBF99] shrink-0">
                  <Calendar className="h-6 w-6" />
                </div>
              )}

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-[#DFBF99]">
                    {item.date}
                  </span>
                  <span className="rounded bg-[#321338] px-2 py-0.5 text-[10px] font-mono text-[#EADFD5]">
                    {item.category}
                  </span>
                  {item.isMilestone && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.2 rounded">
                      <Sparkles className="h-2.5 w-2.5" /> Key Milestone
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-medium text-[#FAF7F2] truncate">
                  {item.title}
                </h3>

                <p className="text-xs text-[#8F7D8A] font-sans line-clamp-2 max-w-2xl">
                  {item.description}
                </p>

                {item.location && (
                  <div className="flex items-center gap-1 text-[11px] text-[#C9B7C3]">
                    <MapPin className="h-3 w-3 text-[#DFBF99]" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reorder and Action Buttons */}
            <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#DFBF99]/10">
              <button
                onClick={() => handleMove(idx, 'up')}
                disabled={idx === 0}
                title="Move earlier"
                className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#280C2C] disabled:opacity-30 transition"
              >
                <MoveUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleMove(idx, 'down')}
                disabled={idx === timeline.length - 1}
                title="Move later"
                className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#280C2C] disabled:opacity-30 transition"
              >
                <MoveDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleOpenEdit(item)}
                title="Edit Milestone"
                className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#280C2C] transition"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteConfirmId(item.id)}
                title="Delete Milestone"
                className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center bg-black/80 backdrop-blur-md">
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
                Delete Milestone?
              </h3>
              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This will remove this milestone event from the couple’s timeline.
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
                    await dispatchDelete(deleteConfirmId);
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

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 sm:p-8 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-6">
                <h3 className="editorial-title text-2xl text-[#FAF7F2] font-normal">
                  {editingEvent.title ? 'Edit Milestone' : 'Add New Milestone'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2] hover:bg-[#2A0C2F] transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Milestone Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    placeholder="e.g. The Night We Said 'Yes'"
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingEvent.date || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Category
                    </label>
                    <select
                      value={editingEvent.category || 'Special'}
                      onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Description / Story
                  </label>
                  <textarea
                    rows={3}
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    placeholder="Narrate this chapter of your journey..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingEvent.location || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    placeholder="e.g. Positano, Amalfi Coast"
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Milestone Photos
                  </label>
                  <MemoryImageUploader
                    photos={photoItems}
                    onChange={setPhotoItems}
                    singleMode={false}
                    label="Milestone Photos"
                    subtitle="Select from gallery or take photos with device"
                    idPrefix="timeline"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Milestone Soundtrack / Voice Recording
                  </label>
                  <AudioUploader
                    songTitle={editingEvent.songTitle || ''}
                    songUrl={editingEvent.songUrl || editingEvent.voiceNoteUrl || ''}
                    onSongTitleChange={(val) => setEditingEvent({ ...editingEvent, songTitle: val })}
                    onSongUrlChange={(val) => setEditingEvent({ ...editingEvent, songUrl: val, voiceNoteUrl: val })}
                    disabled={isSaving}
                    idPrefix="timeline-audio"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingEvent.isMilestone)}
                      onChange={(e) => setEditingEvent({ ...editingEvent, isMilestone: e.target.checked })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    <Sparkles className="h-4 w-4 text-[#DFBF99]" />
                    <span>Highlight as Major Relationship Milestone</span>
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
                    <span>{isSaving ? 'Saving Milestone...' : 'Save Milestone'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
