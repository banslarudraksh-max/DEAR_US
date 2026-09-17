import React, { useState } from 'react';
import { Memory, MemoryCategory, MemoryMood } from '../../types';
import { vaultStorage } from '../../services/vaultStorage';
import { useAuth } from '../../context/AuthContext';
import { AudioUploader } from '../common/AudioUploader';
import { 
  X, 
  Upload, 
  Sparkles, 
  Heart, 
  Lock, 
  Music, 
  MapPin, 
  Calendar, 
  Mic, 
  Smile,
  ShieldCheck
} from 'lucide-react';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: Memory) => void;
  initialMemory?: Memory | null;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMemory,
}) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState(initialMemory?.title || '');
  const [date, setDate] = useState(initialMemory?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialMemory?.description || '');
  const [location, setLocation] = useState(initialMemory?.location || '');
  const [category, setCategory] = useState<MemoryCategory>(initialMemory?.category || 'Special');
  const [mood, setMood] = useState<MemoryMood>(initialMemory?.mood || 'Love');
  const [tagsInput, setTagsInput] = useState(initialMemory?.tags.join(', ') || '');
  const [isFavorite, setIsFavorite] = useState(initialMemory?.isFavorite || false);
  const [isPrivate, setIsPrivate] = useState(initialMemory?.isPrivate || false);
  const [songTitle, setSongTitle] = useState(initialMemory?.songTitle || '');
  const [songUrl, setSongUrl] = useState(initialMemory?.songUrl || '');
  const [photos, setPhotos] = useState<string[]>(initialMemory?.photos || []);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const categories: MemoryCategory[] = [
    'Special',
    'Travel',
    'Birthday',
    'Festival',
    'Funny',
    'Everyday',
    'Achievement',
    'Other',
  ];

  const moods: MemoryMood[] = [
    'Love',
    'Peaceful',
    'Magical',
    'Emotional',
    'Adventure',
    'Celebration',
    'Funny',
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await vaultStorage.uploadFile(files[i]);
        urls.push(url);
      }
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err: any) {
      alert(err.message || 'Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out the title and description');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const memory: Memory = {
      id: initialMemory?.id || `mem-${Date.now()}`,
      userId: user?.id || 'partner-1',
      creatorName: user?.name || profile.name,
      title: title.trim(),
      date,
      description: description.trim(),
      location: location.trim() || undefined,
      category,
      mood,
      tags,
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85'],
      isFavorite,
      isPrivate,
      songTitle: songTitle.trim() || undefined,
      songUrl: songUrl.trim() || undefined,
      reactions: initialMemory?.reactions || [],
      createdAt: initialMemory?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(memory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-xl rounded-2xl border border-[#DFBF99]/30 bg-[#17091A] p-6 sm:p-8 shadow-2xl shadow-black/80">
        <button
          id="close-memory-modal-btn"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250E28] transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="editorial-title text-3xl sm:text-4xl font-normal text-[#FAF7F2] mb-6">
          {initialMemory ? 'Edit Memory' : 'Preserve a Sacred Memory'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Night at the Rooftop Garden"
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Venice, Italy"
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#1B0B1E] text-[#FAF7F2]">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as MemoryMood)}
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              >
                {moods.map((m) => (
                  <option key={m} value={m} className="bg-[#1B0B1E] text-[#FAF7F2]">{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Story & Atmosphere</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you feel? The sounds, the colors, what made this moment unforgettable..."
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none leading-relaxed transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="sunset, coffee, vinyl"
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          {/* Connected Soundtrack / Audio System */}
          <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/50 p-4">
            <AudioUploader
              songTitle={songTitle}
              songUrl={songUrl}
              onSongTitleChange={setSongTitle}
              onSongUrlChange={setSongUrl}
              label="Connected Soundtrack / Audio"
              idPrefix="memory-audio"
            />
          </div>

          {/* Privacy & Favorite switches */}
          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/40 p-3.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="h-4 w-4 rounded border-[#DFBF99]/30 text-[#7D2146] focus:ring-[#DFBF99]"
              />
              <span className="text-xs font-medium text-[#FAF7F2] flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-[#DFBF99]" />
                Mark as Cherished Favorite
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 rounded border-[#DFBF99]/30 text-[#7D2146] focus:ring-[#DFBF99]"
              />
              <span className="text-xs font-medium text-[#FAF7F2] flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#C9B7C3]" />
                Private (Visible only to me)
              </span>
            </label>
          </div>

          {/* Photos Upload & Previews */}
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Photographs</label>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-2.5">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative h-16 w-20 rounded-lg overflow-hidden border border-[#DFBF99]/30">
                    <img src={url} alt="upload" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 rounded-bl-md bg-black/75 p-1 text-white hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#DFBF99]/35 bg-[#250E28]/40 px-4 py-4 text-xs text-[#C9B7C3] cursor-pointer hover:border-[#DFBF99]/70 hover:bg-[#250E28]/80 transition">
              <Upload className="h-4 w-4 text-[#DFBF99]" />
              <span>{uploading ? 'Processing & Uploading...' : 'Upload Photos (JPEG, PNG, WebP up to 10MB)'}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#DFBF99]/20 px-5 py-2 text-xs font-medium text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40 transition"
            >
              Cancel
            </button>
            <button
              id="save-memory-submit-btn"
              type="submit"
              className="rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
            >
              {initialMemory ? 'Save Changes' : 'Preserve Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
