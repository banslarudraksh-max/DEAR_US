import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BucketListItem, CategoryItem } from '../../types';
import { 
  ListTodo, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  AlertTriangle, 
  X, 
  Check 
} from 'lucide-react';

interface AdminBucketListProps {
  bucketList?: BucketListItem[];
  items?: BucketListItem[];
  categories: CategoryItem[];
  onSaveBucketItem?: (item: BucketListItem) => Promise<void>;
  onSaveItem?: (item: BucketListItem) => Promise<void>;
  onDeleteBucketItem?: (id: string) => Promise<void>;
  onDeleteItem?: (id: string) => Promise<void>;
  currentUser: string;
}

export const AdminBucketList: React.FC<AdminBucketListProps> = ({
  bucketList: bucketListProp,
  items: itemsProp,
  categories,
  onSaveBucketItem,
  onSaveItem,
  onDeleteBucketItem,
  onDeleteItem,
  currentUser,
}) => {
  const bucketList = itemsProp || bucketListProp || [];
  const dispatchSave = onSaveItem || onSaveBucketItem || (async () => {});
  const dispatchDelete = onDeleteItem || onDeleteBucketItem || (async () => {});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'pending'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<BucketListItem> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredItems = bucketList.filter((b) => {
    const q = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = !q || (
      Boolean(b.title && b.title.toLowerCase().includes(q)) ||
      Boolean(b.description && b.description.toLowerCase().includes(q))
    );
    const matchesStatus = 
      filterCompleted === 'all' ||
      (filterCompleted === 'completed' && b.isCompleted) ||
      (filterCompleted === 'pending' && !b.isCompleted);
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingItem({
      id: `bl-${Date.now()}`,
      userId: 'partner-1',
      title: '',
      description: '',
      category: categories[0]?.name || 'Travel',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BucketListItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleToggleComplete = async (item: BucketListItem) => {
    const updated: BucketListItem = {
      ...item,
      isCompleted: !item.isCompleted,
      completedDate: !item.isCompleted ? new Date().toISOString().split('T')[0] : undefined,
    };
    await dispatchSave(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title) return;

    const finalItem: BucketListItem = {
      id: editingItem.id || `bl-${Date.now()}`,
      userId: editingItem.userId || 'partner-1',
      title: editingItem.title,
      description: editingItem.description || '',
      category: editingItem.category || 'Travel',
      isCompleted: Boolean(editingItem.isCompleted),
      completedDate: editingItem.completedDate,
      targetDate: editingItem.targetDate,
      createdAt: editingItem.createdAt || new Date().toISOString(),
    };

    await dispatchSave(finalItem);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Bucket List &amp; Shared Dreams
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Administer future wishes, target dates, and completed relationship milestones.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Add New Wish</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-[#DFBF99]/20 bg-[#18081B]/80 p-3 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/70" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bucket list items..."
            className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
          />
        </div>

        <div className="inline-flex rounded-xl border border-[#DFBF99]/20 bg-[#120514] p-0.5 text-xs">
          <button
            onClick={() => setFilterCompleted('all')}
            className={`rounded-lg px-3 py-1.5 transition ${filterCompleted === 'all' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A]'}`}
          >
            All ({bucketList.length})
          </button>
          <button
            onClick={() => setFilterCompleted('pending')}
            className={`rounded-lg px-3 py-1.5 transition ${filterCompleted === 'pending' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A]'}`}
          >
            Pending ({bucketList.filter(b => !b.isCompleted).length})
          </button>
          <button
            onClick={() => setFilterCompleted('completed')}
            className={`rounded-lg px-3 py-1.5 transition ${filterCompleted === 'completed' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A]'}`}
          >
            Completed ({bucketList.filter(b => b.isCompleted).length})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
              item.isCompleted 
                ? 'border-[#DFBF99]/10 bg-[#120514]/60 opacity-80' 
                : 'border-[#DFBF99]/20 bg-[#170619]/90 hover:border-[#DFBF99]/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => handleToggleComplete(item)}
                className="text-[#DFBF99] hover:text-[#FAF7F2] transition shrink-0"
              >
                {item.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-950" />
                ) : (
                  <Circle className="h-5 w-5 text-[#8F7D8A]" />
                )}
              </button>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium text-[#FAF7F2] truncate ${item.isCompleted ? 'line-through text-[#8F7D8A]' : ''}`}>
                    {item.title}
                  </span>
                  <span className="rounded bg-[#2E1233] px-2 py-0.5 text-[10px] font-mono text-[#DFBF99] shrink-0">
                    {item.category}
                  </span>
                </div>
                {item.description && (
                  <p className="text-[11px] text-[#8F7D8A] truncate max-w-xl font-sans">
                    {item.description}
                  </p>
                )}
                {item.targetDate && !item.isCompleted && (
                  <span className="text-[10px] font-mono text-[#DFBF99] flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Target: {item.targetDate}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleOpenEdit(item)}
                className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                title="Edit Wish"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteConfirmId(item.id)}
                className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                title="Delete Wish"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {isModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-4">
                <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal">
                  {editingItem.title ? 'Edit Bucket Item' : 'New Bucket Wish'}
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
                    Wish Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="e.g. Sleep under Northern Lights in a glass igloo"
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Category
                    </label>
                    <select
                      value={editingItem.category || 'Travel'}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Target Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={editingItem.targetDate || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, targetDate: e.target.value })}
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Notes &amp; Inspiration
                  </label>
                  <textarea
                    rows={3}
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Specific hotel, season, or plans..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingItem.isCompleted)}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        isCompleted: e.target.checked,
                        completedDate: e.target.checked ? (editingItem.completedDate || new Date().toISOString().split('T')[0]) : undefined
                      })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    <span>Mark as Completed Wish</span>
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
                    Save Wish
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
                Delete Bucket List Item?
              </h3>
              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This will delete this wish permanently from your shared bucket list.
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
                    await dispatchDelete(deleteConfirmId);
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
