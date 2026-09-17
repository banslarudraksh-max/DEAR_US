import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { vaultStorage } from '../../services/vaultStorage';
import { useAuth } from '../../context/AuthContext';
import { AudioUploader } from '../common/AudioUploader';
import { X, Upload, Calendar, MapPin, Tag, Flag } from 'lucide-react';

interface TimelineEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: TimelineEvent) => void;
  initialEvent?: TimelineEvent | null;
}

export const TimelineEventModal: React.FC<TimelineEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || 'Milestone');
  const [tagsInput, setTagsInput] = useState(initialEvent?.tags.join(', ') || '');
  const [isMilestone, setIsMilestone] = useState(initialEvent?.isMilestone ?? true);
  const [songTitle, setSongTitle] = useState(initialEvent?.songTitle || '');
  const [songUrl, setSongUrl] = useState(initialEvent?.songUrl || initialEvent?.voiceNoteUrl || '');
  const [photos, setPhotos] = useState<string[]>(initialEvent?.photos || []);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

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
      alert(err.message || 'Error uploading photos');
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

    const event: TimelineEvent = {
      id: initialEvent?.id || `tl-${Date.now()}`,
      userId: user?.id || 'partner-1',
      title,
      date,
      description,
      location: location.trim() || undefined,
      category,
      tags,
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'],
      isMilestone,
      songTitle: songTitle.trim() || undefined,
      songUrl: songUrl.trim() || undefined,
      voiceNoteUrl: songUrl.trim() || undefined,
      createdAt: initialEvent?.createdAt || new Date().toISOString(),
    };

    onSave(event);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-lg rounded-2xl border border-[#DFBF99]/30 bg-[#17091A] p-6 sm:p-8 shadow-2xl shadow-black/80">
        <button
          id="close-timeline-modal"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250E28] transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="editorial-title text-2xl sm:text-3xl font-normal text-[#FAF7F2] mb-5">
          {initialEvent ? 'Edit Milestone' : 'Record a Relationship Milestone'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Milestone Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Day We Said I Love You"
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
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              >
                <option value="The Beginning" className="bg-[#1B0B1E] text-[#FAF7F2]">The Beginning</option>
                <option value="Milestone" className="bg-[#1B0B1E] text-[#FAF7F2]">Milestone</option>
                <option value="Adventure" className="bg-[#1B0B1E] text-[#FAF7F2]">Adventure</option>
                <option value="Travel" className="bg-[#1B0B1E] text-[#FAF7F2]">Travel</option>
                <option value="Family" className="bg-[#1B0B1E] text-[#FAF7F2]">Family</option>
                <option value="Celebration" className="bg-[#1B0B1E] text-[#FAF7F2]">Celebration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Park, New York"
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Story & Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the story of what happened..."
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="first date, sunset, promises"
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/40 p-3">
            <input
              type="checkbox"
              id="isMilestone"
              checked={isMilestone}
              onChange={(e) => setIsMilestone(e.target.checked)}
              className="h-4 w-4 rounded border-[#DFBF99]/30 text-[#7D2146] focus:ring-[#DFBF99]"
            />
            <label htmlFor="isMilestone" className="text-xs text-[#FAF7F2] font-medium cursor-pointer">
              Major Chapter Milestone (Pin on Chronicle)
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Milestone Photographs</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {photos.map((p, idx) => (
                <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-[#DFBF99]/30">
                  <img src={p} alt="Milestone" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-0 right-0 bg-black/70 p-1 text-white hover:text-red-400 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#DFBF99]/35 bg-[#250E28]/40 px-3 py-3 text-xs text-[#C9B7C3] cursor-pointer hover:border-[#DFBF99]/70 hover:bg-[#250E28]/80 transition">
              <Upload className="h-4 w-4 text-[#DFBF99]" />
              <span>{uploading ? 'Uploading...' : 'Upload Milestone Photographs'}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Connected Soundtrack / Audio */}
          <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/50 p-4">
            <AudioUploader
              songTitle={songTitle}
              songUrl={songUrl}
              onSongTitleChange={setSongTitle}
              onSongUrlChange={setSongUrl}
              label="Milestone Soundtrack / Voice Memory"
              idPrefix="timeline-audio"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#DFBF99]/15">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#DFBF99]/20 px-5 py-2 text-xs font-medium text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40 transition"
            >
              Cancel
            </button>
            <button
              id="save-timeline-event-btn"
              type="submit"
              className="rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2 text-xs font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
            >
              {initialEvent ? 'Save Changes' : 'Record Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
