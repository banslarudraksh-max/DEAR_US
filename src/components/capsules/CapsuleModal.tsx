import React, { useState } from 'react';
import { MemoryCapsule } from '../../types';
import { vaultStorage } from '../../services/vaultStorage';
import { useAuth } from '../../context/AuthContext';
import { AudioUploader } from '../common/AudioUploader';
import { X, Upload, Plus, Trash2, Calendar, Link2, Sparkles } from 'lucide-react';

interface CapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (capsule: MemoryCapsule) => void;
}

export const CapsuleModal: React.FC<CapsuleModalProps> = ({ isOpen, onClose, onSave }) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [unlockDate, setUnlockDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState<string[]>(['']);
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [songTitle, setSongTitle] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const u = await vaultStorage.uploadFile(files[i]);
        urls.push(u);
      }
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err: any) {
      alert(err.message || 'Error uploading photos');
    } finally {
      setUploading(false);
    }
  };

  const handleAddNote = () => setNotes([...notes, '']);
  const handleUpdateNote = (index: number, val: string) => {
    const copy = [...notes];
    copy[index] = val;
    setNotes(copy);
  };
  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill out capsule title and secret message');
      return;
    }

    const capsule: MemoryCapsule = {
      id: `cap-${Date.now()}`,
      title: title.trim(),
      theme: theme.trim() || 'Timeless Memories',
      createdDate: new Date().toISOString().split('T')[0],
      unlockDate,
      creatorName: `${profile.name} & ${profile.partnerName}`,
      creatorId: user?.id || 'partner-1',
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'],
      message: message.trim(),
      notes: notes.filter((n) => n.trim().length > 0),
      links: links.filter((l) => l.title.trim().length > 0),
      voiceNoteUrl: songUrl.trim() || undefined,
      songTitle: songTitle.trim() || undefined,
      songUrl: songUrl.trim() || undefined,
      isUnlocked: false,
      createdAt: new Date().toISOString(),
    };

    onSave(capsule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-xl rounded-2xl border border-[#DFBF99]/30 bg-[#17091A] p-6 sm:p-8 shadow-2xl shadow-black/80">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250E28] transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="editorial-title text-2xl sm:text-3xl font-normal text-[#FAF7F2] mb-6">
          Seal a Memory Capsule
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Capsule Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our 2026 Winter Solstice Capsule"
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Theme / Era</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. First Year in the Coastal Home"
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Unlock Date</label>
              <input
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Secret Capsule Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the message that will be revealed when this capsule opens..."
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none leading-relaxed transition"
            />
          </div>

          {/* Sealed Notes / Current favorites */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#DFBF99] uppercase tracking-wider">
                Artifact Notes (Inside jokes, current favorite songs, hopes)
              </label>
              <button
                type="button"
                onClick={handleAddNote}
                className="text-xs text-[#DFBF99] hover:text-[#FAF7F2] flex items-center gap-1 transition"
              >
                <Plus className="h-3 w-3" />
                <span>Add Note</span>
              </button>
            </div>
            <div className="space-y-2">
              {notes.map((note, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => handleUpdateNote(idx, e.target.value)}
                    placeholder={`Artifact #${idx + 1} (e.g. Favorite cafe right now: Osteria)`}
                    className="flex-1 rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
                  />
                  {notes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveNote(idx)}
                      className="p-1 text-[#C9B7C3] hover:text-red-400 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Enclosed Photos</label>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative h-14 w-20 rounded-lg overflow-hidden border border-[#DFBF99]/30">
                    <img src={url} alt="Capsule" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 p-1 bg-black/70 text-white hover:text-red-400 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#DFBF99]/35 bg-[#250E28]/40 px-3 py-3 text-xs text-[#C9B7C3] cursor-pointer hover:border-[#DFBF99]/70 hover:bg-[#250E28]/80 transition">
              <Upload className="h-4 w-4 text-[#DFBF99]" />
              <span>{uploading ? 'Uploading...' : 'Enclose Photos into the Capsule'}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Enclosed Voice Note or Soundtrack */}
          <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/50 p-4">
            <AudioUploader
              songTitle={songTitle}
              songUrl={songUrl}
              onSongTitleChange={setSongTitle}
              onSongUrlChange={setSongUrl}
              label="Preserved Voice Message or Soundtrack"
              idPrefix="capsule-audio"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#DFBF99]/20 px-5 py-2 text-xs font-medium text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
            >
              Seal Capsule Forever
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
