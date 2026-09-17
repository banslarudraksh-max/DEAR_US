import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Memory, CategoryItem, MoodItem, MemoryCategory, MemoryMood } from '../../types';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Heart, 
  Lock, 
  Unlock, 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  ArrowUpDown, 
  Eye, 
  Upload, 
  X, 
  Check, 
  AlertTriangle,
  Music,
  Mic,
  Tag,
  Smile,
  ChevronDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoveUp,
  MoveDown,
  Loader2
} from 'lucide-react';
import { MemoryImageUploader } from './MemoryImageUploader';
import { 
  UploadPhotoItem, 
  uploadMemoryPhotoToStorage, 
  syncMemoryPhotosToDatabase,
  optimizeImageFile
} from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface AdminMemoriesProps {
  memories: Memory[];
  categories: CategoryItem[];
  moods: MoodItem[];
  onSaveMemory: (memory: Memory) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  currentUser: string;
}

export const AdminMemories: React.FC<AdminMemoriesProps> = ({
  memories,
  categories,
  moods,
  onSaveMemory,
  onDeleteMemory,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterPrivate, setFilterPrivate] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title' | 'photos'>('date-desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal states
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Partial<Memory> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [photoItems, setPhotoItems] = useState<UploadPhotoItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Filter & sort
  const filteredMemories = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();

    return memories.filter((m) => {
      const matchesSearch = !q || (
        Boolean(m.title && m.title.toLowerCase().includes(q)) ||
        Boolean(m.description && m.description.toLowerCase().includes(q)) ||
        Boolean(m.location && m.location.toLowerCase().includes(q)) ||
        Boolean(m.category && m.category.toLowerCase().includes(q)) ||
        Boolean(m.mood && m.mood.toLowerCase().includes(q)) ||
        Boolean(Array.isArray(m.tags) && m.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q)))
      );

      const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
      const matchesMood = selectedMood === 'all' || m.mood === selectedMood;
      const matchesFav = !filterFavorite || m.isFavorite;
      const matchesPriv = filterPrivate === null || m.isPrivate === filterPrivate;

      return matchesSearch && matchesCat && matchesMood && matchesFav && matchesPriv;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      if (sortBy === 'date-asc') return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'photos') return (b.photos?.length || 0) - (a.photos?.length || 0);
      return 0;
    });
  }, [memories, searchTerm, selectedCategory, selectedMood, filterFavorite, filterPrivate, sortBy]);

  const handleOpenAdd = () => {
    const newId = `mem-${Date.now()}`;
    setEditingMemory({
      id: newId,
      userId: user?.id || 'partner-1',
      creatorName: currentUser,
      title: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      photos: [],
      location: '',
      mood: (moods[0]?.name as MemoryMood) || 'Love',
      category: (categories[0]?.name as MemoryCategory) || 'Special',
      tags: [],
      isFavorite: false,
      isPrivate: false,
      songTitle: '',
      songUrl: '',
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setPhotoItems([]);
    setTagInput('');
    setSaveError(null);
    setUploadStatusMessage(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (memory: Memory) => {
    setEditingMemory({ ...memory });
    // Transform existing photo URLs into UploadPhotoItem array
    const existing: UploadPhotoItem[] = (memory.photos || []).map((url, idx) => ({
      id: `existing-${idx}-${url.slice(-8)}`,
      previewUrl: url,
      url: url,
      status: 'success',
      progress: 100,
      isExisting: true,
    }));
    setPhotoItems(existing);
    setTagInput('');
    setSaveError(null);
    setUploadStatusMessage(null);
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory || !editingMemory.title || !editingMemory.date || isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    setUploadStatusMessage('Preparing photos...');

    try {
      const memoryId = editingMemory.id || `mem-${Date.now()}`;
      const authUserId = user?.id || editingMemory.userId || 'partner-1';

      // 1. Process and upload each photo item in order
      const finalPhotoUrls: string[] = [];
      const updatedPhotos = [...photoItems];

      for (let i = 0; i < updatedPhotos.length; i++) {
        const item = updatedPhotos[i];
        if (item.file) {
          // New file upload
          setUploadStatusMessage(`Uploading photo ${i + 1} of ${updatedPhotos.length}...`);
          item.status = 'uploading';
          setPhotoItems([...updatedPhotos]);

          try {
            const uploaded = await uploadMemoryPhotoToStorage(
              item.file,
              memoryId,
              authUserId,
              (progress) => {
                item.progress = progress;
                setPhotoItems([...updatedPhotos]);
              }
            );
            item.status = 'success';
            item.url = uploaded.url;
            item.storagePath = uploaded.path;
            finalPhotoUrls.push(uploaded.url);
          } catch (uploadErr: any) {
            console.warn('Direct upload notice, preserving photo locally:', uploadErr);
            try {
              const { dataUrl } = await optimizeImageFile(item.file);
              item.status = 'success';
              item.url = dataUrl;
              item.storagePath = `local/${memoryId}/${Date.now()}`;
              finalPhotoUrls.push(dataUrl);
            } catch (fallbackErr) {
              console.error('Local photo processing fallback failed:', fallbackErr);
              item.status = 'error';
              item.error = 'Could not process photo';
            }
            setPhotoItems([...updatedPhotos]);
          }
        } else if (item.url) {
          // Existing photo URL
          finalPhotoUrls.push(item.url);
        }
      }

      setUploadStatusMessage('Saving memory...');

      const finalMemory: Memory = {
        id: memoryId,
        userId: authUserId,
        creatorName: editingMemory.creatorName || currentUser,
        title: editingMemory.title,
        date: editingMemory.date,
        description: editingMemory.description || '',
        photos: finalPhotoUrls,
        location: editingMemory.location || '',
        latitude: editingMemory.latitude,
        longitude: editingMemory.longitude,
        mood: editingMemory.mood || 'Love',
        category: editingMemory.category || 'Special',
        tags: editingMemory.tags || [],
        isFavorite: Boolean(editingMemory.isFavorite),
        isPrivate: Boolean(editingMemory.isPrivate),
        songTitle: editingMemory.songTitle,
        songUrl: editingMemory.songUrl,
        voiceNoteUrl: editingMemory.voiceNoteUrl,
        voiceNoteDuration: editingMemory.voiceNoteDuration,
        reactions: editingMemory.reactions || [],
        createdAt: editingMemory.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 2. Save memory record in storage / database
      await onSaveMemory(finalMemory);

      // 3. Keep public.memory_photos database table synchronized with the exact order
      try {
        await syncMemoryPhotosToDatabase(memoryId, finalPhotoUrls);
      } catch (syncErr) {
        console.warn('Notice syncing memory_photos table:', syncErr);
      }

      setIsEditModalOpen(false);
      setEditingMemory(null);
      setPhotoItems([]);
    } catch (err: any) {
      console.error('Error saving memory:', err);
      setSaveError(err.message || 'Failed to save memory.');
    } finally {
      setIsSaving(false);
      setUploadStatusMessage(null);
    }
  };

  const handleAddTag = () => {
    if (!tagInput || !tagInput.trim() || !editingMemory) return;
    const currentTags = editingMemory.tags || [];
    const normalized = tagInput.trim().toLowerCase();
    if (!currentTags.some(t => typeof t === 'string' && t.toLowerCase() === normalized)) {
      setEditingMemory({
        ...editingMemory,
        tags: [...currentTags, normalized]
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!editingMemory) return;
    setEditingMemory({
      ...editingMemory,
      tags: (editingMemory.tags || []).filter(t => t !== tag)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Memory Archives
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Full administrative curation: manage titles, multi-photo galleries, tags, locations, and privacy visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl border border-[#DFBF99]/20 bg-[#19081B] p-0.5 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg px-3 py-1.5 transition ${viewMode === 'table' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A] hover:text-[#C9B7C3]'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-3 py-1.5 transition ${viewMode === 'grid' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A] hover:text-[#C9B7C3]'}`}
            >
              Cards Grid
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg"
          >
            <Plus className="h-4 w-4 text-[#DFBF99]" />
            <span>New Memory</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#18081B]/80 p-4 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/70" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search memories by title, description, location, or tag..."
              className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7584] hover:text-[#FAF7F2]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-[#DFBF99]/25 bg-[#120514] px-3 py-2 text-xs text-[#FAF7F2] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Mood Filter */}
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="rounded-xl border border-[#DFBF99]/25 bg-[#120514] px-3 py-2 text-xs text-[#FAF7F2] focus:outline-none"
            >
              <option value="all">All Moods</option>
              {moods.map((m) => (
                <option key={m.id} value={m.name}>{m.emoji} {m.name}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-[#DFBF99]/25 bg-[#120514] px-3 py-2 text-xs text-[#FAF7F2] focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="photos">Most Photos</option>
            </select>

            {/* Quick toggles */}
            <button
              onClick={() => setFilterFavorite(!filterFavorite)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition flex items-center gap-1.5 ${
                filterFavorite 
                  ? 'border-amber-400/50 bg-amber-950/50 text-amber-300' 
                  : 'border-[#DFBF99]/20 bg-[#120514] text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${filterFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favorites</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#8F7D8A] pt-1">
          <span>Showing {filteredMemories.length} of {memories.length} memories</span>
          {(searchTerm || selectedCategory !== 'all' || selectedMood !== 'all' || filterFavorite) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedMood('all');
                setFilterFavorite(false);
                setFilterPrivate(null);
              }}
              className="text-[#DFBF99] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="overflow-hidden rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 backdrop-blur-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#FAF7F2]">
              <thead className="border-b border-[#DFBF99]/15 bg-[#200A23]/80 text-[#DFBF99] font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">Memory Title</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category / Mood</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFBF99]/10">
                {filteredMemories.map((m) => (
                  <tr key={m.id} className="hover:bg-[#200A24]/60 transition">
                    <td className="py-3 px-4">
                      {m.photos && m.photos[0] ? (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-[#DFBF99]/20 bg-[#250E28] shrink-0">
                          <img 
                            src={m.photos[0]} 
                            alt={m.title} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {m.photos.length > 1 && (
                            <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[9px] font-mono text-[#FAF7F2]">
                              +{m.photos.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#DFBF99]/15 bg-[#19081B] text-[#8F7D8A]">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-[240px]">
                      <div className="font-medium text-[#FAF7F2] truncate">{m.title}</div>
                      <div className="text-[#8F7D8A] truncate text-[11px] font-sans mt-0.5">
                        {m.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#C9B7C3] whitespace-nowrap">
                      {m.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-[#321338] px-2 py-0.5 text-[10px] font-mono text-[#DFBF99]">
                          {m.category}
                        </span>
                        <span className="text-xs">{m.mood}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#C9B7C3] whitespace-nowrap">
                      {m.location ? (
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="h-3 w-3 text-[#DFBF99] shrink-0" />
                          <span className="truncate">{m.location}</span>
                        </span>
                      ) : (
                        <span className="text-[#554652]">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {m.isFavorite && (
                          <span title="Favorite" className="text-amber-400">
                            <Heart className="h-3.5 w-3.5 fill-amber-400" />
                          </span>
                        )}
                        {m.isPrivate ? (
                          <span title="Private Memory" className="text-rose-400 flex items-center gap-0.5 text-[10px] font-mono">
                            <Lock className="h-3 w-3" /> Private
                          </span>
                        ) : (
                          <span title="Shared in Vault" className="text-emerald-400/80 flex items-center gap-0.5 text-[10px] font-mono">
                            <Unlock className="h-3 w-3" /> Shared
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="rounded-lg p-1.5 text-[#C9B7C3] hover:bg-[#341238] hover:text-[#FAF7F2] transition"
                          title="Edit Memory"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(m.id)}
                          className="rounded-lg p-1.5 text-rose-400/80 hover:bg-rose-950/40 hover:text-rose-300 transition"
                          title="Delete Memory"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              className="group overflow-hidden rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 backdrop-blur-sm transition hover:border-[#DFBF99]/50"
            >
              <div className="relative h-44 w-full bg-[#200A23] overflow-hidden">
                {m.photos && m.photos[0] ? (
                  <img
                    src={m.photos[0]}
                    alt={m.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#8F7D8A]">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono text-[#FAF7F2] backdrop-blur-md">
                    {m.date}
                  </span>
                  <span className="rounded-md bg-[#7D2146]/80 px-2 py-0.5 text-[10px] font-mono text-[#FAF7F2] backdrop-blur-md">
                    {m.category}
                  </span>
                </div>
                {m.photos && m.photos.length > 1 && (
                  <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-mono text-[#FAF7F2] backdrop-blur-md">
                    {m.photos.length} photos
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-[#FAF7F2] text-sm leading-snug truncate">
                    {m.title}
                  </h3>
                  {m.isFavorite && (
                    <Heart className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-[#8F7D8A] font-sans line-clamp-2">
                  {m.description}
                </p>

                {m.location && (
                  <div className="flex items-center gap-1 text-[11px] text-[#C9B7C3] pt-1">
                    <MapPin className="h-3 w-3 text-[#DFBF99]" />
                    <span className="truncate">{m.location}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#DFBF99]/15">
                  <span className="text-[11px] text-[#DFBF99]/80 font-mono">
                    Mood: {m.mood}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="rounded-lg p-1.5 text-[#C9B7C3] hover:bg-[#341238] hover:text-[#FAF7F2] transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(m.id)}
                      className="rounded-lg p-1.5 text-rose-400/80 hover:bg-rose-950/40 hover:text-rose-300 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                Permanently Delete Memory?
              </h3>
              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This action will delete this memory, associated photo links, and sentimental metadata from the vault database.
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
                    await onDeleteMemory(deleteConfirmId);
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

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="w-full max-w-3xl my-8 rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 sm:p-8 text-left shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-6">
                <div>
                  <h3 className="editorial-title text-2xl text-[#FAF7F2] font-normal">
                    {editingMemory.id?.startsWith('mem-') && editingMemory.title ? 'Edit Memory' : 'Add New Memory'}
                  </h3>
                  <span className="text-xs font-mono text-[#DFBF99]">
                    Author: {editingMemory.creatorName || currentUser}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2] hover:bg-[#2A0C2F] transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Title & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Memory Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMemory.title || ''}
                      onChange={(e) => setEditingMemory({ ...editingMemory, title: e.target.value })}
                      placeholder="e.g. Rainy afternoon at Shakespeare & Company"
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingMemory.date || ''}
                      onChange={(e) => setEditingMemory({ ...editingMemory, date: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Story / Description
                  </label>
                  <textarea
                    rows={4}
                    value={editingMemory.description || ''}
                    onChange={(e) => setEditingMemory({ ...editingMemory, description: e.target.value })}
                    placeholder="Tell the story of what happened, what was spoken, and how it felt..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Category & Mood & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Category
                    </label>
                    <select
                      value={editingMemory.category || 'Special'}
                      onChange={(e) => setEditingMemory({ ...editingMemory, category: e.target.value as MemoryCategory })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Mood
                    </label>
                    <select
                      value={editingMemory.mood || 'Love'}
                      onChange={(e) => setEditingMemory({ ...editingMemory, mood: e.target.value as MemoryMood })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    >
                      {moods.map((m) => (
                        <option key={m.id} value={m.name}>{m.emoji} {m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingMemory.location || ''}
                      onChange={(e) => setEditingMemory({ ...editingMemory, location: e.target.value })}
                      placeholder="e.g. Paris, France"
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Memory Direct Image Uploader */}
                <div className="space-y-2.5 rounded-2xl border border-[#DFBF99]/20 bg-[#140516]/80 p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#EADFD5] flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[#DFBF99]" />
                      <span>Memory Photographs ({photoItems.length})</span>
                    </label>
                    <span className="text-[11px] text-[#8F7D8A]">
                      {photoItems.length > 0 ? 'First photo is cover • Drag or tap arrows to reorder' : 'Direct upload from device'}
                    </span>
                  </div>

                  <MemoryImageUploader
                    photos={photoItems}
                    onChange={(items) => setPhotoItems(items)}
                    disabled={isSaving}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-[#DFBF99]" />
                    <span>Tags</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tag and press Enter..."
                      className="flex-1 rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="rounded-xl border border-[#DFBF99]/25 bg-[#250E28] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A]"
                    >
                      Add Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(editingMemory.tags || []).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-md bg-[#250D29] border border-[#DFBF99]/20 px-2 py-0.5 text-[11px] font-mono text-[#FAF7F2]"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-[#8F7D8A] hover:text-rose-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Audio & Song Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5 flex items-center gap-1.5">
                      <Music className="h-3.5 w-3.5 text-[#DFBF99]" />
                      <span>Soundtrack Title</span>
                    </label>
                    <input
                      type="text"
                      value={editingMemory.songTitle || ''}
                      onChange={(e) => setEditingMemory({ ...editingMemory, songTitle: e.target.value })}
                      placeholder="e.g. Clair de Lune - Claude Debussy"
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5 flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5 text-[#DFBF99]" />
                      <span>Soundtrack URL (Spotify / YouTube)</span>
                    </label>
                    <input
                      type="url"
                      value={editingMemory.songUrl || ''}
                      onChange={(e) => setEditingMemory({ ...editingMemory, songUrl: e.target.value })}
                      placeholder="https://open.spotify.com/track/..."
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Toggles: Favorite & Visibility */}
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#DFBF99]/15">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingMemory.isFavorite)}
                      onChange={(e) => setEditingMemory({ ...editingMemory, isFavorite: e.target.checked })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    <Heart className={`h-4 w-4 ${editingMemory.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-[#8F7D8A]'}`} />
                    <span>Mark as Cherished Favorite</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingMemory.isPrivate)}
                      onChange={(e) => setEditingMemory({ ...editingMemory, isPrivate: e.target.checked })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    {editingMemory.isPrivate ? (
                      <Lock className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Unlock className="h-4 w-4 text-emerald-400" />
                    )}
                    <span>Private Memory (Only Visible to Creator &amp; Admin)</span>
                  </label>
                </div>

                {/* Form Footer */}
                {saveError && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#DFBF99]/15">
                  <div className="text-xs text-[#DFBF99]">
                    {uploadStatusMessage && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#DFBF99]" />
                        <span className="truncate">{uploadStatusMessage}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setIsEditModalOpen(false)}
                      className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A] transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-[#DFBF99]" />
                          <span>{uploadStatusMessage || 'Saving Memory...'}</span>
                        </>
                      ) : (
                        <span>Save Memory</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
