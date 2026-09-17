import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HomepageCms, Memory, TimelineEvent } from '../../types';
import { 
  Layers, 
  Save, 
  Eye, 
  Sparkles, 
  Check, 
  ToggleLeft, 
  ToggleRight, 
  Layout, 
  Type, 
  Compass,
  ArrowRight
} from 'lucide-react';

interface AdminHomepageCmsProps {
  cms: HomepageCms;
  memories: Memory[];
  timeline: TimelineEvent[];
  onSaveCms: (cms: HomepageCms) => Promise<void>;
}

export const AdminHomepageCms: React.FC<AdminHomepageCmsProps> = ({
  cms,
  memories,
  timeline,
  onSaveCms,
}) => {
  const [formData, setFormData] = useState<HomepageCms>({ ...cms });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveCms({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const featuredMemory = memories.find(m => m.id === formData.featuredMemoryId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Homepage Content Management (CMS)
          </h2>
          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Customize the editorial typography, hero banners, button labels, and featured memory showcase on the public home view.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Changes Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 text-[#DFBF99]" />
              <span>Publish to Homepage</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Hero Section Copy */}
          <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DFBF99]/15">
              <Type className="h-4 w-4 text-[#DFBF99]" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
                Hero Typography &amp; Narrative
              </h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                Hero Heading
              </label>
              <input
                type="text"
                value={formData.heroHeading}
                onChange={(e) => setFormData({ ...formData, heroHeading: e.target.value })}
                className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                Intro Narrative Text
              </label>
              <textarea
                rows={3}
                value={formData.introText}
                onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
                className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Featured Showcase Item */}
          <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DFBF99]/15">
              <Sparkles className="h-4 w-4 text-[#DFBF99]" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
                Featured Stories &amp; Memories
              </h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                Featured Memory Spotlight
              </label>
              <select
                value={formData.featuredMemoryId || ''}
                onChange={(e) => setFormData({ ...formData, featuredMemoryId: e.target.value || undefined })}
                className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
              >
                <option value="">-- No Featured Spotlight --</option>
                {memories.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.date} - {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                Featured Milestone Story
              </label>
              <select
                value={formData.featuredStoryId || ''}
                onChange={(e) => setFormData({ ...formData, featuredStoryId: e.target.value || undefined })}
                className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
              >
                <option value="">-- No Milestone Story --</option>
                {timeline.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.date} - {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DFBF99]/15">
              <Layout className="h-4 w-4 text-[#DFBF99]" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
                Homepage Section Modules
              </h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-[#200A24] transition">
                <div>
                  <div className="text-xs font-medium text-[#FAF7F2]">Show Statistics Banner</div>
                  <div className="text-[11px] text-[#8F7D8A]">Displays memory count, days together, and places explored</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showStats}
                  onChange={(e) => setFormData({ ...formData, showStats: e.target.checked })}
                  className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-[#200A24] transition">
                <div>
                  <div className="text-xs font-medium text-[#FAF7F2]">Show &ldquo;On This Day&rdquo; Banner</div>
                  <div className="text-[11px] text-[#8F7D8A]">Highlights historical memories that happened on today&rsquo;s calendar date</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showOnThisDay}
                  onChange={(e) => setFormData({ ...formData, showOnThisDay: e.target.checked })}
                  className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-[#200A24] transition">
                <div>
                  <div className="text-xs font-medium text-[#FAF7F2]">Show Upcoming Countdown Widget</div>
                  <div className="text-[11px] text-[#8F7D8A]">Shows the nearest upcoming trip or anniversary timer</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showUpcomingCountdown}
                  onChange={(e) => setFormData({ ...formData, showUpcomingCountdown: e.target.checked })}
                  className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Button CTAs */}
          <div className="rounded-xl border border-[#DFBF99]/20 bg-[#160618]/90 p-5 space-y-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DFBF99]/15">
              <Compass className="h-4 w-4 text-[#DFBF99]" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#FAF7F2]">
                Action Button Labels
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                  Primary Story CTA
                </label>
                <input
                  type="text"
                  value={formData.enterStoryCta || ''}
                  onChange={(e) => setFormData({ ...formData, enterStoryCta: e.target.value })}
                  className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                  Add Memory CTA
                </label>
                <input
                  type="text"
                  value={formData.addMemoryCta || ''}
                  onChange={(e) => setFormData({ ...formData, addMemoryCta: e.target.value })}
                  className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                  Rediscover CTA
                </label>
                <input
                  type="text"
                  value={formData.rediscoverCta || ''}
                  onChange={(e) => setFormData({ ...formData, rediscoverCta: e.target.value })}
                  className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-[#DFBF99]/20 bg-[#18081B]/90 p-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFBF99]/15 mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#DFBF99] flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Live Hero Preview
              </span>
              <span className="text-[10px] font-mono text-[#8F7D8A]">Homepage Simulation</span>
            </div>

            {/* Preview Card */}
            <div className="rounded-xl border border-[#DFBF99]/20 bg-gradient-to-b from-[#280E2B] via-[#1B081E] to-[#120514] p-6 text-center space-y-4 shadow-xl">
              <span className="inline-block font-mono text-[10px] tracking-widest text-[#DFBF99] uppercase">
                {formData.tagline}
              </span>

              <h1 className="editorial-title text-3xl text-[#FAF7F2] font-normal leading-tight">
                {formData.heroHeading}
              </h1>

              <p className="text-xs text-[#C9B7C3] leading-relaxed max-w-sm mx-auto font-sans">
                {formData.introText}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="rounded-lg bg-gradient-to-r from-[#7D2146] to-[#5C1632] border border-[#DFBF99]/30 px-3 py-1.5 text-[11px] font-medium text-[#FAF7F2] shadow">
                  {formData.enterStoryCta || 'Enter Our Story'} &rarr;
                </span>
                <span className="rounded-lg border border-[#DFBF99]/30 bg-[#1D0820] px-3 py-1.5 text-[11px] font-medium text-[#DFBF99]">
                  {formData.addMemoryCta || 'Add a Memory'}
                </span>
              </div>

              {formData.showStats && (
                <div className="pt-4 border-t border-[#DFBF99]/15 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#150617]/80 rounded p-2 border border-[#DFBF99]/10">
                    <div className="font-mono text-[#FAF7F2] font-medium">{memories.length}</div>
                    <div className="text-[9px] text-[#8F7D8A]">Memories</div>
                  </div>
                  <div className="bg-[#150617]/80 rounded p-2 border border-[#DFBF99]/10">
                    <div className="font-mono text-[#FAF7F2] font-medium">842</div>
                    <div className="text-[9px] text-[#8F7D8A]">Days Together</div>
                  </div>
                  <div className="bg-[#150617]/80 rounded p-2 border border-[#DFBF99]/10">
                    <div className="font-mono text-[#FAF7F2] font-medium">12</div>
                    <div className="text-[9px] text-[#8F7D8A]">Countries</div>
                  </div>
                </div>
              )}

              {featuredMemory && (
                <div className="pt-3 border-t border-[#DFBF99]/15 text-left">
                  <span className="text-[10px] font-mono text-[#DFBF99] uppercase tracking-wider block mb-1">
                    Featured Spotlight:
                  </span>
                  <div className="text-xs font-medium text-[#FAF7F2] truncate">
                    {featuredMemory.title}
                  </div>
                  <div className="text-[10px] text-[#8F7D8A]">
                    {featuredMemory.date} &bull; {featuredMemory.location}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
