import React, { useState } from 'react';
import { BucketListItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { X, Compass, Calendar } from 'lucide-react';

interface BucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: BucketListItem) => void;
  initialItem?: BucketListItem | null;
}

export const BucketModal: React.FC<BucketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialItem?.title || '');
  const [category, setCategory] = useState(initialItem?.category || 'Travel');
  const [targetDate, setTargetDate] = useState(initialItem?.targetDate || '');
  const [notes, setNotes] = useState(initialItem?.notes || '');

  if (!isOpen) return null;

  const categories = ['Travel', 'Experience', 'Home', 'Creative', 'Culinary', 'Milestone'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const item: BucketListItem = {
      id: initialItem?.id || `bucket-${Date.now()}`,
      userId: user?.id || 'partner-1',
      title: title.trim(),
      category,
      targetDate: targetDate || undefined,
      notes: notes.trim(),
      isCompleted: initialItem?.isCompleted ?? false,
      completedDate: initialItem?.completedDate,
      relatedMemoryIds: initialItem?.relatedMemoryIds || [],
      createdAt: initialItem?.createdAt || new Date().toISOString(),
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-[#DFBF99]/30 bg-[#17091A] p-6 sm:p-8 shadow-2xl shadow-black/80">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250E28] transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="editorial-title text-2xl sm:text-3xl font-normal text-[#FAF7F2] mb-5">
          {initialItem ? 'Edit Dream' : 'Add to Shared Aspirations'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Dream / Milestone</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rent a stone cottage in Cotswolds"
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#1B0B1E] text-[#FAF7F2]">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Target Date (Optional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Notes & Ideas</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this matters, places to visit, season to go..."
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
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
              type="submit"
              className="rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2 text-xs font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
            >
              {initialItem ? 'Save Changes' : 'Add to Dreams'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
