import React, { useState } from 'react';
import { FutureLetter } from '../../types';
import { vaultStorage } from '../../services/vaultStorage';
import { useAuth } from '../../context/AuthContext';
import { AudioUploader } from '../common/AudioUploader';
import { X, Upload, Mail, Calendar, Lock } from 'lucide-react';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (letter: FutureLetter) => void;
}

export const LetterModal: React.FC<LetterModalProps> = ({ isOpen, onClose, onSave }) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState(() => {
    // Default 6 months in future
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [sealColor, setSealColor] = useState('#8B264E');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await vaultStorage.uploadFile(file);
      setPhotoUrl(url);
    } catch (err: any) {
      alert(err.message || 'Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill out the letter title and message');
      return;
    }

    const recipient = user?.id === 'partner-1' ? profile.partnerName : profile.name;

    const letter: FutureLetter = {
      id: `let-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      senderName: user?.name || profile.name,
      senderId: user?.id || 'partner-1',
      recipientName: recipient,
      createdDate: new Date().toISOString().split('T')[0],
      unlockDate,
      photoUrl: photoUrl || undefined,
      songTitle: songTitle.trim() || undefined,
      songUrl: songUrl.trim() || undefined,
      voiceNoteUrl: songUrl.trim() || undefined,
      isOpened: false,
      sealColor,
      createdAt: new Date().toISOString(),
    };

    onSave(letter);
    onClose();
  };

  const sealColors = [
    { name: 'Imperial Wine', hex: '#7D2146' },
    { name: 'Midnight Plum', hex: '#3B1437' },
    { name: 'Antique Rose', hex: '#A23B72' },
    { name: 'Champagne Gold', hex: '#B8976C' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#DFBF99]/30 bg-[#17091A] p-6 sm:p-8 shadow-2xl shadow-black/80">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250E28] transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 font-mono">
          <Mail className="h-4 w-4 text-[#DFBF99]" />
          <span className="text-[11px] uppercase tracking-widest text-[#DFBF99]">Wax-Sealed Epistle</span>
        </div>

        <h2 className="editorial-title text-2xl sm:text-3xl font-normal text-[#FAF7F2] mb-5">
          Write a Letter to the Future
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Letter Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Open When We Celebrate Year 5"
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">
              Unlock Date (When may it be opened?)
            </label>
            <input
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">
              Wax Seal Color
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {sealColors.map((sc) => (
                <button
                  key={sc.hex}
                  type="button"
                  onClick={() => setSealColor(sc.hex)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border transition ${
                    sealColor === sc.hex ? 'border-[#DFBF99] ring-2 ring-[#DFBF99]/50 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: sc.hex }}
                >
                  <span className="text-white font-medium text-[11px]">{sc.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Your Words</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dear my love, when you read this months from now..."
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 p-4 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none leading-relaxed transition"
            />
          </div>

          {/* Photo attachment */}
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Secret Photo (Optional)</label>
            {photoUrl && (
              <div className="relative mb-2 h-24 w-32 rounded-lg overflow-hidden border border-[#DFBF99]/30">
                <img src={photoUrl} alt="Letter attachment" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:text-red-400 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#DFBF99]/35 bg-[#250E28]/40 px-3 py-3 text-xs text-[#C9B7C3] cursor-pointer hover:border-[#DFBF99]/70 hover:bg-[#250E28]/80 transition">
              <Upload className="h-4 w-4 text-[#DFBF99]" />
              <span>{uploading ? 'Attaching photo...' : 'Enclose a Photo inside the envelope'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Intimate Audio / Soundtrack */}
          <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/50 p-4">
            <AudioUploader
              songTitle={songTitle}
              songUrl={songUrl}
              onSongTitleChange={setSongTitle}
              onSongUrlChange={setSongUrl}
              label="Enclosed Whispered Audio or Letter Song"
              idPrefix="letter-audio"
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
              Seal & Entrust Letter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
