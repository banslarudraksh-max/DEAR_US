import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpecialDate, CategoryItem } from '../../types';
import { 
  Heart, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Calendar, 
  Bell, 
  BellOff, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  X,
  Sparkles
} from 'lucide-react';

interface AdminSpecialDatesProps {
  specialDates: SpecialDate[];
  categories: CategoryItem[];
  onSaveSpecialDate: (date: SpecialDate) => Promise<void>;
  onDeleteSpecialDate: (id: string) => Promise<void>;
  currentUser: string;
}

export const AdminSpecialDates: React.FC<AdminSpecialDatesProps> = ({
  specialDates,
  categories,
  onSaveSpecialDate,
  onDeleteSpecialDate,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<Partial<SpecialDate> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredDates = specialDates.filter((d) => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return true;
    return (
      Boolean(d.title && d.title.toLowerCase().includes(q)) ||
      Boolean(d.category && d.category.toLowerCase().includes(q)) ||
      Boolean(d.description && d.description.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingDate({
      id: `sd-${Date.now()}`,
      title: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Anniversary',
      description: '',
      isReminderEnabled: true,
      isVisibleOnHome: true,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (date: SpecialDate) => {
    setEditingDate({ ...date });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDate || !editingDate.title || !editingDate.date) return;

    const finalDate: SpecialDate = {
      id: editingDate.id || `sd-${Date.now()}`,
      title: editingDate.title,
      date: editingDate.date,
      category: editingDate.category || 'Anniversary',
      description: editingDate.description || '',
      isReminderEnabled: Boolean(editingDate.isReminderEnabled),
      isVisibleOnHome: Boolean(editingDate.isVisibleOnHome),
      createdAt: editingDate.createdAt || new Date().toISOString(),
    };

    await onSaveSpecialDate(finalDate);
    setIsModalOpen(false);
    setEditingDate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Special Dates &amp; Anniversaries
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Administer calendar recurring milestones, anniversary banners, and homepage alerts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Add Special Date</span>
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
            placeholder="Search special dates by title, category, or notes..."
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
                <th className="py-3.5 px-4">Milestone Title</th>
                <th className="py-3.5 px-4">Annual Date</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Reminders</th>
                <th className="py-3.5 px-4">Home Presence</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFBF99]/10">
              {filteredDates.map((date) => (
                <tr key={date.id} className="hover:bg-[#200A24]/60 transition">
                  <td className="py-3 px-4 font-medium text-[#FAF7F2] max-w-[220px]">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-[#DFBF99] fill-[#7D2146]/60 shrink-0" />
                      <div className="truncate">
                        <div className="truncate font-medium">{date.title}</div>
                        {date.description && (
                          <div className="text-[10px] text-[#8F7D8A] truncate max-w-[180px]">
                            {date.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#DFBF99] whitespace-nowrap">
                    {date.date}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="rounded bg-[#321338] px-2 py-0.5 text-[10px] font-mono text-[#EADFD5]">
                      {date.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {date.isReminderEnabled ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-700/40">
                        <Bell className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-[#250E28] px-2 py-0.5 text-[10px] font-mono text-[#8F7D8A]">
                        <BellOff className="h-3 w-3" /> Muted
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {date.isVisibleOnHome ? (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-950/60 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-700/40">
                        <Eye className="h-3 w-3" /> Featured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-[#250E28] px-2 py-0.5 text-[10px] font-mono text-[#8F7D8A]">
                        <EyeOff className="h-3 w-3" /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(date)}
                        title="Edit Date"
                        className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(date.id)}
                        title="Delete Date"
                        className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
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

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {isModalOpen && editingDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-4">
                <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal">
                  {editingDate.title ? 'Edit Special Date' : 'Add Special Date'}
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
                    Date Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDate.title || ''}
                    onChange={(e) => setEditingDate({ ...editingDate, title: e.target.value })}
                    placeholder="e.g. First Date Anniversary"
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Calendar Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={editingDate.date || ''}
                      onChange={(e) => setEditingDate({ ...editingDate, date: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingDate.category || 'Anniversary'}
                      onChange={(e) => setEditingDate({ ...editingDate, category: e.target.value })}
                      placeholder="e.g. Anniversary, Birthday"
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Description / Significance
                  </label>
                  <textarea
                    rows={3}
                    value={editingDate.description || ''}
                    onChange={(e) => setEditingDate({ ...editingDate, description: e.target.value })}
                    placeholder="Why this day remains special..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDate.isReminderEnabled)}
                      onChange={(e) => setEditingDate({ ...editingDate, isReminderEnabled: e.target.checked })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    <span>Enable Annual Countdown Reminders</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDate.isVisibleOnHome)}
                      onChange={(e) => setEditingDate({ ...editingDate, isVisibleOnHome: e.target.checked })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    <span>Highlight on Homepage &ldquo;On This Day&rdquo;</span>
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
                    Save Date
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
                Delete Special Date?
              </h3>
              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This will remove the milestone from the couple anniversary tracker.
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
                    await onDeleteSpecialDate(deleteConfirmId);
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
