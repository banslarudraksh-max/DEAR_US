import React, { useState, useEffect } from 'react';
import { BucketListItem, MilestoneCountdown, Memory } from '../../types';
import { BucketModal } from './BucketModal';
import { CountdownModal } from './CountdownModal';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Compass, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  Trash2, 
  ExternalLink,
  Edit3
} from 'lucide-react';

interface BucketListSectionProps {
  bucketList: BucketListItem[];
  countdowns: MilestoneCountdown[];
  memories: Memory[];
  onSaveBucketItem: (item: BucketListItem) => void;
  onDeleteBucketItem: (id: string) => void;
  onSaveCountdown: (countdown: MilestoneCountdown) => void;
  onDeleteCountdown: (id: string) => void;
  onViewMemory: (memory: Memory) => void;
}

export const BucketListSection: React.FC<BucketListSectionProps> = ({
  bucketList = [],
  countdowns = [],
  memories = [],
  onSaveBucketItem,
  onDeleteBucketItem,
  onSaveCountdown,
  onDeleteCountdown,
  onViewMemory,
}) => {
  const safeBucketList = bucketList || [];
  const safeCountdowns = countdowns || [];
  const safeMemories = memories || [];

  const [bucketModalOpen, setBucketModalOpen] = useState(false);
  const [countdownModalOpen, setCountdownModalOpen] = useState(false);
  const [editingBucketItem, setEditingBucketItem] = useState<BucketListItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  // Real-time ticking state for countdown timers
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr + 'T00:00:00').getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, passed: false };
  };

  const handleToggleComplete = (item: BucketListItem) => {
    const willComplete = !item.isCompleted;
    if (willComplete) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E2829C', '#F8B4C4', '#8B264E'],
      });
    }

    const updated: BucketListItem = {
      ...item,
      isCompleted: willComplete,
      completedDate: willComplete ? new Date().toISOString().split('T')[0] : undefined,
    };
    onSaveBucketItem(updated);
  };

  const filteredBucketList = safeBucketList.filter((item) => {
    if (activeTab === 'pending') return !item.isCompleted;
    if (activeTab === 'completed') return item.isCompleted;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. COUNTDOWNS SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#DFBF99]/15 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-2.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-sans font-medium tracking-wide">Looking Forward</span>
            </div>
            <h2 className="editorial-title text-3xl sm:text-4xl font-normal text-[#FAF7F2]">
              Moment Countdowns
            </h2>
            <p className="text-sm text-[#C9B7C3] mt-2 font-sans">
              Every approaching milestone, flight, anniversary, and reunion.
            </p>
          </div>

          <button
            id="add-countdown-btn"
            onClick={() => setCountdownModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-5 py-2 text-xs font-sans font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
          >
            <Plus className="h-4 w-4 text-[#DFBF99]" />
            <span>New Countdown</span>
          </button>
        </div>

        {/* Countdowns Grid or Empty State */}
        {countdowns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countdowns.map((cd) => {
              const time = calculateCountdown(cd.targetDate);
              return (
                <div
                  key={cd.id}
                  className="group relative rounded-2xl border border-[#DFBF99]/18 bg-gradient-to-br from-[#240E2A]/90 via-[#1B0B1E]/90 to-[#140817]/90 p-6 shadow-xl backdrop-blur-xl transition hover:border-[#DFBF99]/40"
                >
                  <div className="flex items-center justify-between text-xs text-[#DFBF99] mb-3 font-sans">
                    <span className="rounded-full bg-[#2F1133] border border-[#DFBF99]/20 px-3 py-0.5 text-[10px] font-medium text-[#DFBF99] tracking-wider uppercase">
                      {cd.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#A896A4]">
                        {new Date(cd.targetDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                      <button
                        onClick={() => onDeleteCountdown(cd.id)}
                        className="p-1 text-[#DFBF99]/40 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-normal text-[#FAF7F2] mb-2 truncate">
                    {cd.title}
                  </h3>

                  {cd.description && (
                    <p className="text-xs text-[#C9B7C3] mb-4 line-clamp-1 font-sans">{cd.description}</p>
                  )}

                  {/* Clock Ticker Digits */}
                  {time.passed ? (
                    <div className="rounded-xl border border-[#DFBF99]/30 bg-[#28112C] p-3 text-center text-xs font-medium text-[#DFBF99] font-sans">
                      The moment has arrived!
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 p-2">
                        <div className="font-mono text-xl sm:text-2xl font-medium text-[#FAF7F2]">{time.days}</div>
                        <div className="text-[9px] uppercase tracking-wider text-[#DFBF99]/70 font-sans mt-0.5">Days</div>
                      </div>
                      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 p-2">
                        <div className="font-mono text-xl sm:text-2xl font-medium text-[#FAF7F2]">{time.hours}</div>
                        <div className="text-[9px] uppercase tracking-wider text-[#DFBF99]/70 font-sans mt-0.5">Hours</div>
                      </div>
                      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 p-2">
                        <div className="font-mono text-xl sm:text-2xl font-medium text-[#FAF7F2]">{time.minutes}</div>
                        <div className="text-[9px] uppercase tracking-wider text-[#DFBF99]/70 font-sans mt-0.5">Mins</div>
                      </div>
                      <div className="rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 p-2">
                        <div className="font-mono text-xl sm:text-2xl font-medium text-[#DFBF99]">{time.seconds}</div>
                        <div className="text-[9px] uppercase tracking-wider text-[#DFBF99]/70 font-sans mt-0.5">Secs</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#DFBF99]/30 bg-[#1B0B1E]/60 p-8 text-center backdrop-blur-xl">
            <Clock className="h-6 w-6 text-[#DFBF99] mx-auto mb-2 opacity-80" />
            <p className="font-serif text-lg text-[#FAF7F2]">No active countdowns</p>
            <p className="text-xs text-[#C9B7C3] mt-1 mb-4 font-sans">Set a countdown for your next trip, anniversary, or surprise reunion.</p>
            <button
              onClick={() => setCountdownModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DFBF99]/40 bg-[#7D2146] px-4 py-1.5 text-xs font-sans text-[#FAF7F2] hover:bg-[#8B264E] transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 text-[#DFBF99]" />
              <span>Create Countdown</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. BUCKET LIST SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#DFBF99]/15 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-2.5">
              <Compass className="h-3.5 w-3.5" />
              <span className="font-sans font-medium tracking-wide">Future Aspirations</span>
            </div>
            <h2 className="editorial-title text-3xl sm:text-4xl font-normal text-[#FAF7F2]">
              Shared Aspirations & Dreams
            </h2>
            <p className="text-sm text-[#C9B7C3] mt-2 font-sans">
              Adventures to undertake, places to wake up in, and promises kept with devotion.
            </p>
          </div>

          <button
            id="add-bucket-dream-btn"
            onClick={() => {
              setEditingBucketItem(null);
              setBucketModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-5 py-2 text-xs font-sans font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
          >
            <Plus className="h-4 w-4 text-[#DFBF99]" />
            <span>Add Dream</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-6 font-sans">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              activeTab === 'all'
                ? 'border border-[#DFBF99]/50 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
                : 'border border-[#DFBF99]/20 bg-[#250E28]/70 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
            }`}
          >
            All Dreams ({safeBucketList.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              activeTab === 'pending'
                ? 'border border-[#DFBF99]/50 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
                : 'border border-[#DFBF99]/20 bg-[#250E28]/70 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
            }`}
          >
            In Progress ({safeBucketList.filter((b) => !b.isCompleted).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              activeTab === 'completed'
                ? 'border border-[#DFBF99]/50 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
                : 'border border-[#DFBF99]/20 bg-[#250E28]/70 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
            }`}
          >
            Fulfilled ({safeBucketList.filter((b) => b.isCompleted).length})
          </button>
        </div>

        {/* Bucket List Items or Empty State */}
        {filteredBucketList.length > 0 ? (
          <div className="space-y-3">
            {filteredBucketList.map((item) => (
              <div
                key={item.id}
                className={`group flex items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 transition backdrop-blur-xl ${
                  item.isCompleted
                    ? 'border-[#DFBF99]/20 bg-[#1F0C22]/60 opacity-85'
                    : 'border-[#DFBF99]/18 bg-[#220E26]/80 hover:border-[#DFBF99]/40 hover:bg-[#28112C]'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className={`mt-0.5 sm:mt-0 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                      item.isCompleted
                        ? 'border-[#DFBF99] bg-[#7D2146] text-[#DFBF99]'
                        : 'border-[#DFBF99]/40 hover:border-[#DFBF99] hover:bg-[#2F1133]'
                    }`}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4 opacity-30 text-[#DFBF99]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1 font-sans">
                      <span className="rounded-full bg-[#2F1133] border border-[#DFBF99]/20 px-2.5 py-0.5 text-[10px] font-medium text-[#DFBF99] tracking-wide uppercase">
                        {item.category}
                      </span>
                      {item.targetDate && (
                        <span className="text-[11px] text-[#A896A4] font-mono">
                          Target: {new Date(item.targetDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      )}
                      {item.isCompleted && item.completedDate && (
                        <span className="text-[11px] text-[#DFBF99] font-mono">
                          Fulfilled: {new Date(item.completedDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`font-serif text-xl sm:text-2xl font-normal ${
                        item.isCompleted ? 'line-through text-[#FAF7F2]/60' : 'text-[#FAF7F2]'
                      }`}
                    >
                      {item.title}
                    </h4>

                    {item.notes && (
                      <p className="text-xs text-[#C9B7C3] mt-1 line-clamp-1 font-sans">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => {
                      setEditingBucketItem(item);
                      setBucketModalOpen(true);
                    }}
                    className="p-1.5 text-[#DFBF99] hover:text-[#FAF7F2] rounded-lg hover:bg-[#2F1133] transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteBucketItem(item.id)}
                    className="p-1.5 text-[#DFBF99]/60 hover:text-red-400 rounded-lg hover:bg-[#2F1133] transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#DFBF99]/30 bg-[#1B0B1E]/60 p-8 text-center backdrop-blur-xl">
            <Compass className="h-6 w-6 text-[#DFBF99] mx-auto mb-2 opacity-80" />
            <p className="font-serif text-lg text-[#FAF7F2]">No dreams found in this filter</p>
            <p className="text-xs text-[#C9B7C3] mt-1 mb-4 font-sans">Add a shared wish, flight, roadtrip, or life milestone to your bucket list.</p>
            <button
              onClick={() => {
                setEditingBucketItem(null);
                setBucketModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DFBF99]/40 bg-[#7D2146] px-4 py-1.5 text-xs font-sans text-[#FAF7F2] hover:bg-[#8B264E] transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 text-[#DFBF99]" />
              <span>Add First Wish</span>
            </button>
          </div>
        )}
      </div>

      <BucketModal
        isOpen={bucketModalOpen}
        onClose={() => setBucketModalOpen(false)}
        onSave={onSaveBucketItem}
        initialItem={editingBucketItem}
      />

      <CountdownModal
        isOpen={countdownModalOpen}
        onClose={() => setCountdownModalOpen(false)}
        onSave={onSaveCountdown}
      />
    </div>
  );
};
