import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CountdownEvent } from '../../types';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Calendar, 
  RotateCcw, 
  AlertTriangle, 
  X,
  Sparkles
} from 'lucide-react';

interface AdminCountdownsProps {
  countdowns: CountdownEvent[];
  onSaveCountdown: (cd: CountdownEvent) => Promise<void>;
  onDeleteCountdown: (id: string) => Promise<void>;
  currentUser: string;
}

export const AdminCountdowns: React.FC<AdminCountdownsProps> = ({
  countdowns,
  onSaveCountdown,
  onDeleteCountdown,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCd, setEditingCd] = useState<Partial<CountdownEvent> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredCountdowns = countdowns.filter((c) => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return true;
    return (
      Boolean(c.title && c.title.toLowerCase().includes(q)) ||
      Boolean(c.description && c.description.toLowerCase().includes(q))
    );
  });

  const getDaysDiff = (targetDateStr: string) => {
    const diff = new Date(targetDateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleOpenAdd = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);

    setEditingCd({
      id: `cd-${Date.now()}`,
      userId: 'partner-1',
      title: '',
      targetDate: futureDate.toISOString().split('T')[0],
      description: '',
      isRecurringYearly: false,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cd: CountdownEvent) => {
    setEditingCd({ ...cd });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCd || !editingCd.title || !editingCd.targetDate) return;

    const finalCd: CountdownEvent = {
      id: editingCd.id || `cd-${Date.now()}`,
      userId: editingCd.userId || 'partner-1',
      title: editingCd.title,
      targetDate: editingCd.targetDate,
      category: editingCd.category || 'Milestone',
      description: editingCd.description || '',
      isRecurringYearly: Boolean(editingCd.isRecurringYearly),
      createdAt: editingCd.createdAt || new Date().toISOString(),
    };

    await onSaveCountdown(finalCd);
    setIsModalOpen(false);
    setEditingCd(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Upcoming Countdowns &amp; Anticipations
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Administer live countdown timers for anniversary dates, plane departures, and shared milestones.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>New Countdown</span>
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
            placeholder="Search countdown timers..."
            className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCountdowns.map((cd) => {
          const daysLeft = getDaysDiff(cd.targetDate);
          const isPast = daysLeft < 0;

          return (
            <div
              key={cd.id}
              className="rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 p-4 transition hover:border-[#DFBF99]/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#DFBF99] font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{cd.targetDate}</span>
                  </div>
                  {cd.isRecurringYearly && (
                    <span className="inline-flex items-center gap-1 rounded bg-purple-950/60 px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-700/40">
                      <RotateCcw className="h-2.5 w-2.5" /> Yearly
                    </span>
                  )}
                </div>

                <h3 className="font-medium text-[#FAF7F2] text-sm mb-1 truncate">
                  {cd.title}
                </h3>

                <p className="text-xs text-[#8F7D8A] font-sans line-clamp-2 mb-3">
                  {cd.description || 'No notes provided.'}
                </p>

                {/* Days remaining badge */}
                <div className="rounded-lg bg-[#240B27] p-3 text-center border border-[#DFBF99]/15">
                  <div className="text-2xl font-mono font-medium text-[#FAF7F2]">
                    {isPast ? 0 : daysLeft}
                  </div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#DFBF99]">
                    {isPast ? 'Event Passed' : 'Days Remaining'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-[#DFBF99]/15">
                <button
                  onClick={() => handleOpenEdit(cd)}
                  className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                  title="Edit Countdown"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(cd.id)}
                  className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                  title="Delete Countdown"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {isModalOpen && editingCd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-4">
                <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal">
                  {editingCd.title ? 'Edit Countdown' : 'New Anticipation'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCd.title || ''}
                    onChange={(e) => setEditingCd({ ...editingCd, title: e.target.value })}
                    placeholder="e.g. Flight to Tokyo Narita"
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingCd.targetDate || ''}
                    onChange={(e) => setEditingCd({ ...editingCd, targetDate: e.target.value })}
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Description / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editingCd.description || ''}
                    onChange={(e) => setEditingCd({ ...editingCd, description: e.target.value })}
                    placeholder="Flight numbers, packing list, or excitement notes..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingCd.isRecurringYearly)}
                      onChange={(e) => setEditingCd({ ...editingCd, isRecurringYearly: e.target.checked })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    <span>Yearly Recurring Event (Auto-renews countdown annually)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg"
                  >
                    Save Countdown
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
                Delete Countdown?
              </h3>
              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This will delete the countdown timer from the dashboard.
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
                    await onDeleteCountdown(deleteConfirmId);
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
