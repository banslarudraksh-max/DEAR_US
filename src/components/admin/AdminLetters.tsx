import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FutureLetter } from '../../types';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Lock, 
  Unlock, 
  Clock, 
  AlertTriangle, 
  X, 
  Check,
  Eye,
  Calendar,
  Sparkles
} from 'lucide-react';
import { AudioUploader } from '../common/AudioUploader';

interface AdminLettersProps {
  letters: FutureLetter[];
  onSaveLetter: (letter: FutureLetter) => Promise<void>;
  onDeleteLetter: (id: string) => Promise<void>;
  currentUser: string;
}

export const AdminLetters: React.FC<AdminLettersProps> = ({
  letters,
  onSaveLetter,
  onDeleteLetter,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<Partial<FutureLetter> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewLetter, setPreviewLetter] = useState<FutureLetter | null>(null);

  const filteredLetters = letters.filter((l) => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return true;
    return (
      Boolean(l.title && l.title.toLowerCase().includes(q)) ||
      Boolean(l.senderName && l.senderName.toLowerCase().includes(q)) ||
      Boolean(l.recipientName && l.recipientName.toLowerCase().includes(q))
    );
  });

  const getDaysRemaining = (unlockDateStr: string) => {
    const diff = new Date(unlockDateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleOpenAdd = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);

    setEditingLetter({
      id: `letter-${Date.now()}`,
      senderId: 'partner-1',
      senderName: currentUser,
      recipientName: currentUser === 'Elena' ? 'Julian' : 'Elena',
      title: '',
      message: '',
      content: '',
      createdDate: new Date().toISOString().split('T')[0],
      unlockDate: tomorrow.toISOString().split('T')[0],
      isOpened: false,
      sealColor: '#7D2146',
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (letter: FutureLetter) => {
    setEditingLetter({ ...letter, content: letter.content || letter.message });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLetter || !editingLetter.title || !editingLetter.unlockDate) return;

    const body = editingLetter.content || editingLetter.message || '';
    const finalLetter: FutureLetter = {
      id: editingLetter.id || `letter-${Date.now()}`,
      senderId: editingLetter.senderId || 'partner-1',
      senderName: editingLetter.senderName || currentUser,
      recipientName: editingLetter.recipientName || 'Partner',
      title: editingLetter.title,
      message: body,
      content: body,
      createdDate: editingLetter.createdDate || editingLetter.createdAt || new Date().toISOString().split('T')[0],
      unlockDate: editingLetter.unlockDate,
      isOpened: Boolean(editingLetter.isOpened),
      openedAt: editingLetter.openedAt,
      sealColor: editingLetter.sealColor || '#7D2146',
      songTitle: editingLetter.songTitle || undefined,
      songUrl: editingLetter.songUrl || undefined,
      voiceNoteUrl: editingLetter.songUrl || editingLetter.voiceNoteUrl || undefined,
      createdAt: editingLetter.createdAt || new Date().toISOString(),
    };

    await onSaveLetter(finalLetter);
    setIsModalOpen(false);
    setEditingLetter(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Future Letters Vault
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Administer sealed envelopes, scheduled unlock timestamps, and privacy seals for each partner.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Compose Sealed Letter</span>
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
            placeholder="Search letters by title, sender, or recipient..."
            className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#FAF7F2]">
            <thead className="border-b border-[#DFBF99]/15 bg-[#200A23]/80 text-[#DFBF99] font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Envelope Title</th>
                <th className="py-3.5 px-4">From &rarr; To</th>
                <th className="py-3.5 px-4">Unlock Date</th>
                <th className="py-3.5 px-4">Seal Color</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFBF99]/10">
              {filteredLetters.map((letter) => {
                const daysLeft = getDaysRemaining(letter.unlockDate);
                const isReady = daysLeft <= 0;

                return (
                  <tr key={letter.id} className="hover:bg-[#200A24]/60 transition">
                    <td className="py-3 px-4 font-medium text-[#FAF7F2] max-w-[220px]">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#DFBF99] shrink-0" />
                        <span className="truncate">{letter.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#C9B7C3] whitespace-nowrap">
                      <span className="font-semibold text-[#FAF7F2]">{letter.senderName}</span>
                      <span className="mx-1 text-[#8F7D8A]">&rarr;</span>
                      <span className="text-[#FAF7F2]">{letter.recipientName}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                      <div>{letter.unlockDate}</div>
                      <div className="text-[10px] text-[#8F7D8A]">
                        {isReady ? (
                          <span className="text-emerald-400">Ready to unlock</span>
                        ) : (
                          <span>{daysLeft} days remaining</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span 
                          className="h-4 w-4 rounded-full border border-white/20 shadow-sm shrink-0" 
                          style={{ backgroundColor: letter.sealColor || '#7D2146' }}
                        />
                        <span className="font-mono text-[10px] text-[#8F7D8A]">
                          {letter.sealColor || '#7D2146'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {letter.isOpened ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-700/40">
                          <Unlock className="h-3 w-3" /> Unsealed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-950/60 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-700/40">
                          <Lock className="h-3 w-3" /> Sealed Envelope
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewLetter(letter)}
                          title="Preview Letter Content"
                          className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(letter)}
                          title="Edit Letter Settings"
                          className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(letter.id)}
                          title="Delete Letter"
                          className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-2xl border border-[#DFBF99]/30 bg-[#1A081C] p-6 sm:p-8 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-4 w-4 rounded-full border border-white/20" 
                    style={{ backgroundColor: previewLetter.sealColor }} 
                  />
                  <span className="font-mono text-xs text-[#DFBF99]">
                    Admin Inspection Mode
                  </span>
                </div>
                <button
                  onClick={() => setPreviewLetter(null)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h3 className="editorial-title text-2xl text-[#FAF7F2] font-normal mb-2">
                {previewLetter.title}
              </h3>

              <div className="flex items-center gap-4 text-xs text-[#C9B7C3] mb-4 pb-3 border-b border-[#DFBF99]/10">
                <span>From: <strong className="text-[#FAF7F2]">{previewLetter.senderName}</strong></span>
                <span>To: <strong className="text-[#FAF7F2]">{previewLetter.recipientName}</strong></span>
                <span>Unlock: <strong className="text-[#DFBF99]">{previewLetter.unlockDate}</strong></span>
              </div>

              <div className="rounded-xl border border-[#DFBF99]/15 bg-[#120414] p-4 text-xs text-[#EADFD5] leading-relaxed font-serif italic max-h-60 overflow-y-auto whitespace-pre-wrap">
                {previewLetter.content || previewLetter.message || '(Empty letter body)'}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setPreviewLetter(null)}
                  className="rounded-xl border border-[#DFBF99]/20 bg-[#280E2B] px-5 py-2 text-xs text-[#FAF7F2] hover:bg-[#38143C]"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {isModalOpen && editingLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-xl rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 sm:p-8 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-6">
                <h3 className="editorial-title text-2xl text-[#FAF7F2] font-normal">
                  {editingLetter.title ? 'Edit Future Letter' : 'Compose Sealed Letter'}
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
                    Envelope Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLetter.title || ''}
                    onChange={(e) => setEditingLetter({ ...editingLetter, title: e.target.value })}
                    placeholder="e.g. Read This on Our 5th Paris Anniversary"
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={editingLetter.senderName || ''}
                      onChange={(e) => setEditingLetter({ ...editingLetter, senderName: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={editingLetter.recipientName || ''}
                      onChange={(e) => setEditingLetter({ ...editingLetter, recipientName: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Scheduled Unlock Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingLetter.unlockDate || ''}
                      onChange={(e) => setEditingLetter({ ...editingLetter, unlockDate: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Wax Seal Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingLetter.sealColor || '#7D2146'}
                        onChange={(e) => setEditingLetter({ ...editingLetter, sealColor: e.target.value })}
                        className="h-9 w-12 rounded-lg border border-[#DFBF99]/25 bg-transparent cursor-pointer p-0.5"
                      />
                      <span className="text-xs font-mono text-[#C9B7C3]">
                        {editingLetter.sealColor || '#7D2146'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Letter Body Content
                  </label>
                  <textarea
                    rows={5}
                    value={editingLetter.content || editingLetter.message || ''}
                    onChange={(e) => setEditingLetter({ ...editingLetter, content: e.target.value, message: e.target.value })}
                    placeholder="Write your timeless words to your future partner..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none leading-relaxed font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Attached Voice Note / Dedicated Soundtrack
                  </label>
                  <AudioUploader
                    songTitle={editingLetter.songTitle || ''}
                    songUrl={editingLetter.songUrl || editingLetter.voiceNoteUrl || ''}
                    onSongTitleChange={(val) => setEditingLetter({ ...editingLetter, songTitle: val })}
                    onSongUrlChange={(val) => setEditingLetter({ ...editingLetter, songUrl: val, voiceNoteUrl: val })}
                    idPrefix="letter-audio"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingLetter.isOpened)}
                      onChange={(e) => setEditingLetter({ ...editingLetter, isOpened: e.target.checked })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    <span>Force Unsealed (Mark as already unsealed &amp; read)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg"
                  >
                    Seal Letter
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
                Delete Future Letter?
              </h3>
              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This sealed envelope will be permanently deleted from the vault.
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
                    await onDeleteLetter(deleteConfirmId);
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
