import React, { useState } from 'react';
import { MilestoneCountdown } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { X, Clock, Calendar } from 'lucide-react';

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (countdown: MilestoneCountdown) => void;
}

export const CountdownModal: React.FC<CountdownModalProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<MilestoneCountdown['category']>('Anniversary');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const categories: MilestoneCountdown['category'][] = ['Anniversary', 'Trip', 'Meeting', 'Special'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cd: MilestoneCountdown = {
      id: `cd-${Date.now()}`,
      userId: user?.id || 'partner-1',
      title: title.trim(),
      targetDate,
      category,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    onSave(cd);
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
          Create a Moment Countdown
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Occasion / Milestone</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flight to Lisbon & Sintra"
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#1B0B1E] text-[#FAF7F2]">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Description / Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Packing list reminders, dinner reservation notes..."
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
              Start Countdown
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
