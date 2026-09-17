import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TimelineEvent } from '../../types';
import { TimelineEventModal } from './TimelineEventModal';
import { UnifiedAudioPlayer } from '../common/AudioPlayer';
import { 
  Sparkles, 
  Plus, 
  MapPin, 
  Calendar, 
  Tag, 
  Flag, 
  Trash2, 
  Edit3,
  Bookmark,
  Heart
} from 'lucide-react';

interface StoryTimelineProps {
  timeline: TimelineEvent[];
  onSaveEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const StoryTimeline: React.FC<StoryTimelineProps> = ({
  timeline = [],
  onSaveEvent,
  onDeleteEvent,
}) => {
  const safeTimeline = timeline || [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'The Beginning', 'Milestone', 'Adventure', 'Travel', 'Family'];

  const filteredTimeline = safeTimeline.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-[#DFBF99]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-3">
            <Sparkles className="h-3 w-3" />
            <span className="font-sans font-medium tracking-wide">Chronicles of Us</span>
          </div>
          <h1 className="editorial-title text-4xl sm:text-5xl font-normal text-[#FAF7F2]">
            Our Story in Milestones
          </h1>
          <p className="text-sm text-[#C9B7C3] mt-2 max-w-lg leading-relaxed font-sans">
            From our quiet first glances to our greatest celebrations. An illustrated story volume of how we grew together.
          </p>
        </div>

        <button
          id="add-timeline-milestone-btn"
          onClick={() => {
            setEditingEvent(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-5 py-2.5 text-xs font-sans font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-sans transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#7D2146] text-[#FAF7F2] border border-[#DFBF99]/40 font-medium shadow-sm'
                : 'border border-[#DFBF99]/15 bg-[#1B0B1E]/60 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250E28]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredTimeline.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#DFBF99]/25 bg-[#1B0B1E]/60 p-12 sm:p-16 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#7D2146]/40 border border-[#DFBF99]/30 text-[#DFBF99]">
            <Heart className="h-5 w-5 fill-current opacity-80" />
          </div>
          <h3 className="font-serif text-2xl text-[#FAF7F2] mb-2 font-normal">No milestones recorded yet.</h3>
          <p className="font-serif italic text-base text-[#DFBF99] mb-3">
            &ldquo;Every great story starts with one moment.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-[#C9B7C3] max-w-sm mx-auto mb-6 leading-relaxed">
            Record the moments, milestones, and whispers that became the foundation of our story.
          </p>
          <button
            onClick={() => {
              setEditingEvent(null);
              setModalOpen(true);
            }}
            className="rounded-full border border-[#DFBF99]/30 bg-[#7D2146] px-6 py-2.5 text-xs font-sans font-medium text-[#FAF7F2] hover:bg-[#8B264E] transition active:scale-95"
          >
            Record First Milestone
          </button>
        </div>
      )}

      {/* Vertical Animated Timeline Line */}
      {filteredTimeline.length > 0 && (
        <div className="relative">
          {/* Smooth Gradient Timeline Backbone */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#DFBF99]/60 via-[#7D2146] to-[#DFBF99]/30" />

          <div className="space-y-12">
            {filteredTimeline.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={item.id}
                  id={`timeline-item-${item.id}`}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Glowing Milestone Node on the line */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#DFBF99]/60 bg-[#17081A] shadow-md shadow-black/60 ring-4 ring-[#7D2146]/30">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#DFBF99]" />
                  </div>

                  {/* Content Card with Scroll Reveal */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="ml-12 sm:ml-0 w-full sm:w-[calc(50%-2rem)]"
                  >
                    <div
                      className={`group rounded-2xl border p-5 sm:p-6 shadow-xl backdrop-blur-xl transition duration-300 hover:border-[#DFBF99]/40 hover:bg-[#250E28] ${
                        item.isMilestone
                          ? 'border-[#DFBF99]/30 bg-gradient-to-br from-[#290E2D]/90 to-[#1A0B1D]/90 ring-1 ring-[#DFBF99]/15'
                          : 'border-[#DFBF99]/18 bg-[#1B0B1E]/85'
                      }`}
                    >
                      {/* Top Row: Vintage Roman / Classic Date & Actions */}
                      <div className="flex items-center justify-between text-xs text-[#DFBF99] mb-2.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="h-3.5 w-3.5 text-[#DFBF99]" />
                          <span>{new Date(item.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        </div>

                        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              setEditingEvent(item);
                              setModalOpen(true);
                            }}
                            className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-full text-[#DFBF99] hover:text-[#FAF7F2] hover:bg-[#321235] transition"
                            title="Edit Milestone"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEvent(item.id)}
                            className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-full text-[#DFBF99] hover:text-red-400 hover:bg-[#321235] transition"
                            title="Delete Milestone"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Milestone Badge if marked */}
                      {item.isMilestone && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DFBF99]/30 bg-[#34133A]/70 px-3 py-0.5 text-[10px] text-[#DFBF99] font-medium mb-2.5">
                          <Flag className="h-2.5 w-2.5" />
                          <span className="font-sans">Major Milestone</span>
                        </div>
                      )}

                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF7F2] mb-2 leading-snug">
                        {item.title}
                      </h3>

                      {item.location && (
                        <div className="flex items-center gap-1.5 text-xs text-[#DFBF99]/90 mb-3 font-sans">
                          <MapPin className="h-3.5 w-3.5 text-[#DFBF99]" />
                          <span>{item.location}</span>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-[#D4C6CE] leading-relaxed mb-4 font-normal">
                        {item.description}
                      </p>

                      {/* Photos grid */}
                      {item.photos && item.photos.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {item.photos.map((photo, pIdx) => (
                            <div key={pIdx} className="overflow-hidden rounded-xl bg-[#280E2A] aspect-[4/3] border border-white/5">
                              <img
                                src={photo}
                                alt={item.title}
                                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Soundtrack or Voice Note Player if exists */}
                      {(item.songUrl || item.voiceNoteUrl) && (
                        <div className="mb-3">
                          <UnifiedAudioPlayer
                            url={item.songUrl || item.voiceNoteUrl}
                            title={item.songTitle || 'Milestone Soundtrack'}
                            subtitle="Milestone Audio"
                            compact={true}
                            idPrefix={`timeline-${item.id}`}
                          />
                        </div>
                      )}

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#DFBF99]/15">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#290E2D]/80 border border-[#DFBF99]/15 px-2.5 py-0.5 text-[10px] font-sans text-[#DFBF99]/85"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TimelineEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveEvent}
        initialEvent={editingEvent}
      />
    </div>
  );
};
