import React, { useState } from 'react';
import { Memory, MilestoneCountdown, TimelineEvent } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Heart, 
  Sparkles, 
  Plus, 
  Clock, 
  MapPin, 
  Flag
} from 'lucide-react';

interface MemoryCalendarProps {
  memories: Memory[];
  countdowns: MilestoneCountdown[];
  timeline: TimelineEvent[];
  onViewMemory: (memory: Memory) => void;
  onOpenAddMemory: (date?: string) => void;
}

export const MemoryCalendar: React.FC<MemoryCalendarProps> = ({
  memories = [],
  countdowns = [],
  timeline = [],
  onViewMemory,
  onOpenAddMemory,
}) => {
  const safeMemories = memories || [];
  const safeCountdowns = countdowns || [];
  const safeTimeline = timeline || [];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayString, setSelectedDayString] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Find memories & events for selected date
  const selectedMemories = safeMemories.filter((m) => m?.date?.startsWith(selectedDayString));
  const selectedTimeline = safeTimeline.filter((t) => t?.date?.startsWith(selectedDayString));
  const selectedCountdowns = safeCountdowns.filter((c) => c?.targetDate?.startsWith(selectedDayString));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-[#DFBF99]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-2.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span className="font-sans font-medium tracking-wide">Almanac of Us</span>
          </div>
          <h1 className="editorial-title text-4xl sm:text-5xl font-normal text-[#FAF7F2]">
            Memory Calendar
          </h1>
          <p className="text-sm text-[#C9B7C3] mt-2 font-sans">
            Track daily moments, anniversaries, and planned celebrations across every season.
          </p>
        </div>

        <button
          onClick={() => onOpenAddMemory(selectedDayString)}
          className="flex items-center gap-2 rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-5 py-2.5 text-xs font-sans font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Add Moment on Selected Date</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#DFBF99]/20 bg-[#17091A]/90 p-6 shadow-xl backdrop-blur-xl">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#DFBF99]/15">
            <h2 className="font-serif text-3xl font-normal text-[#FAF7F2]">
              {monthNames[month]} <span className="text-[#DFBF99]">{year}</span>
            </h2>

            <div className="flex items-center gap-2 font-sans">
              <button
                onClick={handlePrevMonth}
                className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 p-2 text-[#DFBF99] hover:text-[#FAF7F2] hover:bg-[#2F1133] transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-3.5 py-1.5 text-xs text-[#DFBF99] hover:text-[#FAF7F2] transition"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 p-2 text-[#DFBF99] hover:text-[#FAF7F2] hover:bg-[#2F1133] transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-sans font-medium text-[#A896A4] mb-2 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank offset days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[64px] sm:min-h-[82px] rounded-xl bg-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDayString === dateStr;

              // Check if any memories/events match this day
              const dayMemories = safeMemories.filter((m) => m?.date?.startsWith(dateStr));
              const dayTimeline = safeTimeline.filter((t) => t?.date?.startsWith(dateStr));
              const dayCountdowns = safeCountdowns.filter((c) => c?.targetDate?.startsWith(dateStr));

              const hasMemories = dayMemories.length > 0;
              const hasMilestone = dayTimeline.some((t) => t.isMilestone);
              const hasCountdown = dayCountdowns.length > 0;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDayString(dateStr)}
                  className={`group relative min-h-[64px] sm:min-h-[82px] rounded-xl border p-2 cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#DFBF99] bg-[#2E1233] shadow-md ring-1 ring-[#DFBF99]/40'
                      : 'border-[#DFBF99]/15 bg-[#250E28]/40 hover:border-[#DFBF99]/35 hover:bg-[#28112C]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-sans font-medium ${
                        isSelected ? 'text-[#FAF7F2] font-bold' : 'text-[#C9B7C3]'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {hasMilestone && (
                      <span className="h-2 w-2 rounded-full bg-[#DFBF99] shadow-sm shadow-[#DFBF99]/60" />
                    )}
                  </div>

                  {/* Badges / indicators */}
                  <div className="space-y-1">
                    {hasMemories && (
                      <div className="flex items-center gap-1 rounded bg-[#351138]/80 px-1 py-0.5 text-[9px] text-[#DFBF99] truncate font-sans">
                        <Heart className="h-2.5 w-2.5 fill-current text-[#DFBF99] shrink-0" />
                        <span className="truncate">{dayMemories[0].title}</span>
                      </div>
                    )}
                    {hasCountdown && (
                      <div className="rounded bg-[#28112C] border border-[#DFBF99]/20 px-1 py-0.5 text-[9px] text-[#DFBF99] truncate font-sans">
                        {dayCountdowns[0].title}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector (1 Col) */}
        <div className="rounded-2xl border border-[#DFBF99]/20 bg-[#17091A]/90 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DFBF99]/15">
              <span className="text-xs font-mono text-[#DFBF99]">
                {new Date(selectedDayString + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <button
                onClick={() => onOpenAddMemory(selectedDayString)}
                className="text-xs text-[#DFBF99] hover:text-[#FAF7F2] flex items-center gap-1 font-sans transition"
              >
                <Plus className="h-3 w-3" />
                <span>Add Memory</span>
              </button>
            </div>

            {/* List of moments on this day */}
            <div className="space-y-4">
              {selectedMemories.length === 0 &&
                selectedTimeline.length === 0 &&
                selectedCountdowns.length === 0 && (
                  <div className="text-center py-10 text-[#A896A4]">
                    <Sparkles className="mx-auto h-7 w-7 text-[#DFBF99]/40 mb-2" />
                    <p className="font-serif text-lg text-[#FAF7F2]">No entries recorded</p>
                    <p className="text-xs text-[#C9B7C3] mt-1 font-sans">
                      Tap &quot;Add Memory&quot; to preserve what happened on this day.
                    </p>
                  </div>
                )}

              {/* Milestones on this date */}
              {selectedTimeline.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/60 p-3.5"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#DFBF99] mb-1 font-sans">
                    <Flag className="h-3 w-3" />
                    <span className="uppercase tracking-wider">Story Milestone</span>
                  </div>
                  <h4 className="font-serif text-lg font-normal text-[#FAF7F2]">{item.title}</h4>
                  <p className="text-xs text-[#C9B7C3] mt-1 line-clamp-2 font-sans">{item.description}</p>
                </div>
              ))}

              {/* Memories on this date */}
              {selectedMemories.map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => onViewMemory(mem)}
                  className="group flex gap-3 rounded-xl border border-[#DFBF99]/18 bg-[#250E28]/50 p-2.5 transition hover:border-[#DFBF99]/40 hover:bg-[#2F1133] cursor-pointer"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#280E2A] border border-white/10">
                    <img
                      src={mem.photos?.[0] || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80'}
                      alt={mem.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <span className="text-[10px] text-[#DFBF99] uppercase tracking-wider font-sans">{mem.category}</span>
                    <h5 className="font-serif text-base font-normal text-[#FAF7F2] truncate group-hover:text-[#EADFD5] transition">
                      {mem.title}
                    </h5>
                    {mem.location && (
                      <span className="text-[11px] text-[#A896A4] truncate font-sans">{mem.location}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Planned Countdowns */}
              {selectedCountdowns.map((cd) => (
                <div
                  key={cd.id}
                  className="rounded-xl border border-[#DFBF99]/25 bg-[#250E28]/70 p-3.5 text-[#FAF7F2]"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#DFBF99] mb-1 font-sans">
                    <Clock className="h-3 w-3" />
                    <span className="uppercase tracking-wider">Countdown Date</span>
                  </div>
                  <h4 className="font-serif text-lg font-normal text-[#FAF7F2]">{cd.title}</h4>
                  <p className="text-xs text-[#C9B7C3] mt-0.5 font-sans">{cd.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick quote footer */}
          <div className="pt-4 border-t border-[#DFBF99]/15 text-center text-xs text-[#A896A4] italic font-serif">
            &ldquo;We do not remember days, we remember moments.&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
};
