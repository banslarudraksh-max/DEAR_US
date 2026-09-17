import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryItem, MoodItem, Memory, TimelineEvent } from '../../types';
import { 
  Tag, 
  Smile, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  X, 
  Check, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminCategoriesMoodsProps {
  categories: CategoryItem[];
  moods: MoodItem[];
  memories: Memory[];
  timeline: TimelineEvent[];
  onSaveCategory: (cat: CategoryItem) => Promise<void>;
  onDeleteCategory: (id: string, reassignToId?: string) => Promise<void>;
  onSaveMood: (mood: MoodItem) => Promise<void>;
  onDeleteMood: (id: string, reassignToId?: string) => Promise<void>;
}

export const AdminCategoriesMoods: React.FC<AdminCategoriesMoodsProps> = ({
  categories,
  moods,
  memories,
  timeline,
  onSaveCategory,
  onDeleteCategory,
  onSaveMood,
  onDeleteMood,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'moods'>('categories');

  // Category Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem> | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<CategoryItem | null>(null);
  const [catReassignId, setCatReassignId] = useState<string>('');

  // Mood Modal States
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [editingMood, setEditingMood] = useState<Partial<MoodItem> | null>(null);
  const [deleteMoodTarget, setDeleteMoodTarget] = useState<MoodItem | null>(null);
  const [moodReassignId, setMoodReassignId] = useState<string>('');

  // Calculate usage counts
  const getCategoryUsage = (catName: string) => {
    const memCount = memories.filter(m => m.category === catName).length;
    const tlCount = timeline.filter(t => t.category === catName).length;
    return { memCount, tlCount, total: memCount + tlCount };
  };

  const getMoodUsage = (moodName: string) => {
    return memories.filter(m => m.mood === moodName).length;
  };

  // Category handlers
  const handleOpenAddCategory = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: '',
      color: '#7D2146',
      description: '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;

    const finalCat: CategoryItem = {
      id: editingCategory.id || `cat-${Date.now()}`,
      name: editingCategory.name.trim(),
      color: editingCategory.color || '#7D2146',
      description: editingCategory.description || '',
    };

    await onSaveCategory(finalCat);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Mood handlers
  const handleOpenAddMood = () => {
    setEditingMood({
      id: `mood-${Date.now()}`,
      name: '',
      emoji: '✨',
      color: '#DFBF99',
      description: '',
    });
    setIsMoodModalOpen(true);
  };

  const handleOpenEditMood = (mood: MoodItem) => {
    setEditingMood({ ...mood });
    setIsMoodModalOpen(true);
  };

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMood || !editingMood.name) return;

    const finalMood: MoodItem = {
      id: editingMood.id || `mood-${Date.now()}`,
      name: editingMood.name.trim(),
      emoji: editingMood.emoji || '✨',
      color: editingMood.color || '#DFBF99',
      description: editingMood.description || '',
    };

    await onSaveMood(finalMood);
    setIsMoodModalOpen(false);
    setEditingMood(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Categories &amp; Emotional Moods
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Define classification taxonomies and sentiment tags applied to memories, places, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#DFBF99]/20 bg-[#19081B] p-0.5 text-xs">
            <button
              onClick={() => setActiveSubTab('categories')}
              className={`rounded-lg px-3 py-1.5 transition ${activeSubTab === 'categories' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A]'}`}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveSubTab('moods')}
              className={`rounded-lg px-3 py-1.5 transition ${activeSubTab === 'moods' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A]'}`}
            >
              Moods ({moods.length})
            </button>
          </div>

          <button
            onClick={activeSubTab === 'categories' ? handleOpenAddCategory : handleOpenAddMood}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
          >
            <Plus className="h-4 w-4 text-[#DFBF99]" />
            <span>{activeSubTab === 'categories' ? 'New Category' : 'New Mood'}</span>
          </button>
        </div>
      </div>

      {/* CATEGORIES VIEW */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const usage = getCategoryUsage(cat.name);

            return (
              <div
                key={cat.id}
                className="rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 p-4 transition hover:border-[#DFBF99]/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <h3 className="font-medium text-[#FAF7F2] text-sm">
                        {cat.name}
                      </h3>
                    </div>
                    <span className="rounded bg-[#2E1233] px-2 py-0.5 text-[10px] font-mono text-[#DFBF99]">
                      {usage.total} linked
                    </span>
                  </div>

                  <p className="text-xs text-[#8F7D8A] font-sans line-clamp-2 mb-3">
                    {cat.description || 'General vault categorization'}
                  </p>

                  <div className="text-[10px] font-mono text-[#8F7D8A]">
                    {usage.memCount} memories &bull; {usage.tlCount} milestones
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-[#DFBF99]/15">
                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                    title="Edit Category"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteCatTarget(cat);
                      const other = categories.find(c => c.id !== cat.id);
                      setCatReassignId(other?.id || '');
                    }}
                    className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                    title="Delete Category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MOODS VIEW */}
      {activeSubTab === 'moods' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moods.map((mood) => {
            const usageCount = getMoodUsage(mood.name);

            return (
              <div
                key={mood.id}
                className="rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 p-4 transition hover:border-[#DFBF99]/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{mood.emoji}</span>
                      <h3 className="font-medium text-[#FAF7F2] text-sm">
                        {mood.name}
                      </h3>
                    </div>
                    <span className="rounded bg-[#2E1233] px-2 py-0.5 text-[10px] font-mono text-[#DFBF99]">
                      {usageCount} memories
                    </span>
                  </div>

                  <p className="text-xs text-[#8F7D8A] font-sans line-clamp-2 mb-3">
                    {mood.description || 'Sentiment tag'}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8F7D8A]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: mood.color || '#DFBF99' }}
                    />
                    <span>Hex: {mood.color || '#DFBF99'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-[#DFBF99]/15">
                  <button
                    onClick={() => handleOpenEditMood(mood)}
                    className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                    title="Edit Mood"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteMoodTarget(mood);
                      const other = moods.find(m => m.id !== mood.id);
                      setMoodReassignId(other?.id || '');
                    }}
                    className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                    title="Delete Mood"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-4">
                <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal">
                  {editingCategory.name ? 'Edit Category' : 'New Category'}
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    placeholder="e.g. Travel &amp; Voyages"
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Badge Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingCategory.color || '#7D2146'}
                      onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                      className="h-9 w-12 rounded-lg border border-[#DFBF99]/25 bg-transparent cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-[#C9B7C3]">
                      {editingCategory.color || '#7D2146'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    placeholder="Describe what memories belong here..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 shadow-lg"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mood Modal */}
      <AnimatePresence>
        {isMoodModalOpen && editingMood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-4">
                <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal">
                  {editingMood.name ? 'Edit Mood' : 'New Sentiment Mood'}
                </h3>
                <button
                  onClick={() => setIsMoodModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMood} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Emoji
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={editingMood.emoji || '✨'}
                      onChange={(e) => setEditingMood({ ...editingMood, emoji: e.target.value })}
                      className="w-full text-center rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-lg text-[#FAF7F2] focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Mood Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMood.name || ''}
                      onChange={(e) => setEditingMood({ ...editingMood, name: e.target.value })}
                      placeholder="e.g. Nostalgic, Grateful"
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingMood.color || '#DFBF99'}
                      onChange={(e) => setEditingMood({ ...editingMood, color: e.target.value })}
                      className="h-9 w-12 rounded-lg border border-[#DFBF99]/25 bg-transparent cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-[#C9B7C3]">
                      {editingMood.color || '#DFBF99'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
                  <button
                    type="button"
                    onClick={() => setIsMoodModalOpen(false)}
                    className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 shadow-lg"
                  >
                    Save Mood
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Category with Safe Reassignment */}
      <AnimatePresence>
        {deleteCatTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#1D081F] p-6 text-left shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-950/60 text-rose-400 border border-rose-700/40 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal">
                    Delete Category &ldquo;{deleteCatTarget.name}&rdquo;?
                  </h3>
                  <span className="text-[11px] text-[#C9B7C3]">
                    {getCategoryUsage(deleteCatTarget.name).total} linked items will be affected
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-4 font-sans">
                Choose another category to reassign existing memories and milestones to, ensuring no items become uncategorized:
              </p>

              <div className="mb-6">
                <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                  Reassign existing items to:
                </label>
                <select
                  value={catReassignId}
                  onChange={(e) => setCatReassignId(e.target.value)}
                  className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                >
                  {categories
                    .filter(c => c.id !== deleteCatTarget.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteCatTarget(null)}
                  className="rounded-xl border border-[#DFBF99]/20 bg-[#280E2B] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#38143C]"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onDeleteCategory(deleteCatTarget.id, catReassignId);
                    setDeleteCatTarget(null);
                  }}
                  className="rounded-xl border border-rose-500/50 bg-rose-700 px-5 py-2.5 text-xs font-medium text-white hover:bg-rose-600 shadow-lg"
                >
                  Reassign &amp; Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Mood with Safe Reassignment */}
      <AnimatePresence>
        {deleteMoodTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#1D081F] p-6 text-left shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-950/60 text-rose-400 border border-rose-700/40 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal">
                    Delete Mood &ldquo;{deleteMoodTarget.name}&rdquo;?
                  </h3>
                  <span className="text-[11px] text-[#C9B7C3]">
                    {getMoodUsage(deleteMoodTarget.name)} memories currently tagged
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                  Reassign tagged memories to:
                </label>
                <select
                  value={moodReassignId}
                  onChange={(e) => setMoodReassignId(e.target.value)}
                  className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                >
                  {moods
                    .filter(m => m.id !== deleteMoodTarget.id)
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteMoodTarget(null)}
                  className="rounded-xl border border-[#DFBF99]/20 bg-[#280E2B] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#38143C]"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onDeleteMood(deleteMoodTarget.id, moodReassignId);
                    setDeleteMoodTarget(null);
                  }}
                  className="rounded-xl border border-rose-500/50 bg-rose-700 px-5 py-2.5 text-xs font-medium text-white hover:bg-rose-600 shadow-lg"
                >
                  Reassign &amp; Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
