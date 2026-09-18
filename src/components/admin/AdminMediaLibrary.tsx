import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminMediaItem, Memory, PlaceMemory, TimelineEvent } from '../../types';
import { 
  Camera, 
  Search, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Filter, 
  X, 
  AlertTriangle,
  ImageIcon
} from 'lucide-react';

interface AdminMediaLibraryProps {
  mediaList: AdminMediaItem[];
  memories: Memory[];
  places: PlaceMemory[];
  timeline: TimelineEvent[];
  onUploadMedia: (item: AdminMediaItem) => Promise<void>;
  onReplaceMedia: (oldUrl: string, newUrl: string) => Promise<void>;
  onDeleteMedia: (id: string, url: string) => Promise<void>;
  currentUser: string;
}

export const AdminMediaLibrary: React.FC<AdminMediaLibraryProps> = ({
  mediaList,
  memories,
  places,
  timeline,
  onUploadMedia,
  onReplaceMedia,
  onDeleteMedia,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<AdminMediaItem | null>(null);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaName, setNewMediaName] = useState('');
  const [replacementUrl, setReplacementUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleteConfirmMedia, setDeleteConfirmMedia] = useState<AdminMediaItem | null>(null);

  // Derive consolidated media items from actual entities + mediaList
  const consolidatedMedia = useMemo(() => {
    const map = new Map<string, AdminMediaItem>();

    // Seed from mediaList
    mediaList.forEach(m => map.set(m.url, m));

    // Discover photos from memories
    memories.forEach(mem => {
      mem.photos?.forEach((url, idx) => {
        if (!map.has(url)) {
          map.set(url, {
            id: `media-mem-${mem.id}-${idx}`,
            url,
            fileName: `${mem.title.slice(0, 24)} - Photo ${idx + 1}`,
            uploadedAt: mem.date || new Date().toISOString(),
            size: '2.4 MB',
            dimensions: '1920x1080',
            usedIn: [`Memory: ${mem.title}`],
          });
        } else {
          const item = map.get(url)!;
          const usage = `Memory: ${mem.title}`;
          if (!item.usedIn.includes(usage)) {
            item.usedIn.push(usage);
          }
        }
      });
    });

    // Discover from timeline
    timeline.forEach(tl => {
      if (tl.photoUrl) {
        if (!map.has(tl.photoUrl)) {
          map.set(tl.photoUrl, {
            id: `media-tl-${tl.id}`,
            url: tl.photoUrl,
            fileName: `Milestone - ${tl.title.slice(0, 24)}`,
            uploadedAt: tl.date || new Date().toISOString(),
            size: '1.8 MB',
            dimensions: '1600x1200',
            usedIn: [`Milestone: ${tl.title}`],
          });
        } else {
          const item = map.get(tl.photoUrl)!;
          const usage = `Milestone: ${tl.title}`;
          if (!item.usedIn.includes(usage)) item.usedIn.push(usage);
        }
      }
    });

    // Discover from places
    places.forEach(p => {
      p.photos?.forEach((url, idx) => {
        if (!map.has(url)) {
          map.set(url, {
            id: `media-pl-${p.id}-${idx}`,
            url,
            fileName: `${p.name} - Photo ${idx + 1}`,
            uploadedAt: p.visitDate || new Date().toISOString(),
            size: '2.1 MB',
            dimensions: '1920x1280',
            usedIn: [`Atlas: ${p.name}`],
          });
        } else {
          const item = map.get(url)!;
          const usage = `Atlas: ${p.name}`;
          if (!item.usedIn.includes(usage)) item.usedIn.push(usage);
        }
      });
    });

    return Array.from(map.values());
  }, [mediaList, memories, places, timeline]);

  const filteredMedia = consolidatedMedia.filter(m => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return true;
    return (
      Boolean(m.fileName && m.fileName.toLowerCase().includes(q)) ||
      (Array.isArray(m.usedIn) && m.usedIn.some(u => typeof u === 'string' && u.toLowerCase().includes(q)))
    );
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file.');
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new Error('Image must be 20MB or smaller.');
    }

    // Show selected file name
    setNewMediaName(
      file.name.replace(/\.[^/.]+$/, '')
    );

    // Upload directly to Supabase Storage
    const uploadedUrl = await vaultStorage.uploadFile(
      file,
      'vault-photos'
    );

    // Use uploaded public URL for preview
    setNewMediaUrl(uploadedUrl);

    console.log('✅ Image uploaded:', uploadedUrl);
  } catch (error) {
    console.error('❌ Media upload failed:', error);

    alert(
      error instanceof Error
        ? error.message
        : 'Failed to upload image.'
    );
  }
};
  
  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim()) return;

    const newItem: AdminMediaItem = {
      id: `media-${Date.now()}`,
      url: newMediaUrl.trim(),
      fileName: newMediaName.trim() || `Asset-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      size: '2.5 MB',
      dimensions: '1920x1080',
      usedIn: ['Media Library Asset'],
    };

    await onUploadMedia(newItem);
    setIsUploadModalOpen(false);
    setNewMediaUrl('');
    setNewMediaName('');
  };

  const handleOpenReplace = (media: AdminMediaItem) => {
    setSelectedMedia(media);
    setReplacementUrl(media.url);
    setIsReplaceModalOpen(true);
  };

  const handleExecuteReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia || !replacementUrl.trim()) return;

    await onReplaceMedia(selectedMedia.url, replacementUrl.trim());
    setIsReplaceModalOpen(false);
    setSelectedMedia(null);
    setReplacementUrl('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Media Library &amp; Photo Vault
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Inspect all high-resolution photos, replace outdated links globally, and manage asset usage.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Upload className="h-4 w-4 text-[#DFBF99]" />
          <span>Upload New Asset</span>
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
            placeholder="Search media by filename, memory title, or place..."
            className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((media) => (
          <div
            key={media.id}
            className="group rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 p-3 transition hover:border-[#DFBF99]/40 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-40 w-full rounded-lg overflow-hidden border border-[#DFBF99]/15 bg-[#250E28] mb-3">
                <img
                  src={media.url}
                  alt={media.fileName}
                  className="h-full w-full object-cover transition group-hover:scale-105 duration-300"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => handleCopy(media.url)}
                  className="absolute top-2 right-2 rounded-md bg-black/70 p-1.5 text-[#DFBF99] backdrop-blur-md hover:text-[#FAF7F2] transition"
                  title="Copy Image URL"
                >
                  {copiedUrl === media.url ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <h4 className="font-medium text-[#FAF7F2] text-xs truncate mb-1" title={media.fileName}>
                {media.fileName}
              </h4>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#8F7D8A] mb-2">
                <span>{media.dimensions || '1920x1080'}</span>
                <span>{media.size || '2.4 MB'}</span>
              </div>

              {/* Usage Badges */}
              <div className="space-y-1">
                {media.usedIn.slice(0, 2).map((use, i) => (
                  <span
                    key={i}
                    className="block truncate rounded bg-[#270E2C] border border-[#DFBF99]/15 px-2 py-0.5 text-[10px] font-mono text-[#DFBF99]"
                    title={use}
                  >
                    {use}
                  </span>
                ))}
                {media.usedIn.length > 2 && (
                  <span className="text-[10px] text-[#8F7D8A] font-mono">
                    +{media.usedIn.length - 2} more references
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#DFBF99]/15 text-xs">
              <button
                onClick={() => handleOpenReplace(media)}
                className="inline-flex items-center gap-1 text-[#C9B7C3] hover:text-[#FAF7F2] transition text-[11px]"
                title="Replace photo everywhere"
              >
                <RefreshCw className="h-3 w-3 text-[#DFBF99]" />
                <span>Replace</span>
              </button>

              <button
                onClick={() => setDeleteConfirmMedia(media)}
                className="text-rose-400/80 hover:text-rose-300 transition"
                title="Delete Photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-4">
                <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal">
                  Upload Media Asset
                </h3>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Asset Label / Title
                  </label>
                  <input
                    type="text"
                    value={newMediaName}
                    onChange={(e) => setNewMediaName(e.target.value)}
                    placeholder="e.g. Sunset in Positano High-Res"
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                {/* File Dropzone / Manual Input */}
                <div className="rounded-xl border-2 border-dashed border-[#DFBF99]/30 bg-[#120514]/60 p-6 text-center">
                  <Camera className="mx-auto h-8 w-8 text-[#DFBF99] mb-2" />
                  <p className="text-xs text-[#FAF7F2] font-medium mb-1">
                    Select photo file from disk
                  </p>
                  <p className="text-[11px] text-[#8F7D8A] mb-3">
                    Supports JPG, PNG, WebP (up to 20MB)
                  </p>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#DFBF99]/30 bg-[#280E2B] px-4 py-2 text-xs font-medium text-[#DFBF99] hover:bg-[#38143C]">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Or Paste Remote Image URL
                  </label>
                  <input
                    type="url"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                {newMediaUrl && (
                  <div className="relative h-28 w-full rounded-xl overflow-hidden border border-[#DFBF99]/20">
                    <img
                      src={newMediaUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newMediaUrl}
                    className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 disabled:opacity-40"
                  >
                    Add to Vault Library
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Replace Image Modal */}
      <AnimatePresence>
        {isReplaceModalOpen && selectedMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-4">
                <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal">
                  Global Photo Replacement
                </h3>
                <button
                  onClick={() => setIsReplaceModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-4 font-sans">
                Replacing this image will update every memory, milestone, place, and capsule currently referencing it across the database.
              </p>

              <form onSubmit={handleExecuteReplace} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Current Image URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedMedia.url}
                    className="w-full rounded-xl border border-[#DFBF99]/15 bg-[#100412] py-2 px-3 text-[11px] text-[#8F7D8A] select-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    New Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={replacementUrl}
                    onChange={(e) => setReplacementUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
                  <button
                    type="button"
                    onClick={() => setIsReplaceModalOpen(false)}
                    className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 shadow-lg"
                  >
                    Replace Everywhere
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmMedia && (
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
                Delete Photo from Vault?
              </h3>
              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This will remove the photo from the media library and any associated memory galleries.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmMedia(null)}
                  className="rounded-xl border border-[#DFBF99]/20 bg-[#280E2B] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#38143C] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onDeleteMedia(deleteConfirmMedia.id, deleteConfirmMedia.url);
                    setDeleteConfirmMedia(null);
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
