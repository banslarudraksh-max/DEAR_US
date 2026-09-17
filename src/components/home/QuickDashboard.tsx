import React from 'react';
import { motion } from 'motion/react';
import { Memory, MemoryCapsule, BucketListItem, ActiveTab, CountdownEvent } from '../../types';
import { 
  Heart, 
  Lock, 
  ArrowRight, 
  Compass, 
  Calendar, 
  MapPin, 
  Clock, 
  Camera, 
  Sparkles, 
  Bookmark,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface QuickDashboardProps {
  memories: Memory[];
  capsules: MemoryCapsule[];
  bucketList: BucketListItem[];
  countdowns?: CountdownEvent[];
  onNavigate: (tab: ActiveTab) => void;
  onViewMemory: (mem: Memory) => void;
  onOpenAddMemory: () => void;
}

export const QuickDashboard: React.FC<QuickDashboardProps> = ({
  memories = [],
  capsules = [],
  bucketList = [],
  countdowns = [],
  onNavigate,
  onViewMemory,
  onOpenAddMemory,
}) => {
  const safeMemories = memories || [];
  const safeCapsules = capsules || [];
  const safeBucketList = bucketList || [];
  const safeCountdowns = countdowns || [];

  // Recent memories (sorted by date descending)
  const recentMemories = [...safeMemories]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Favorite memory (featured)
  const featuredFavorite = safeMemories.find((m) => m?.isFavorite) || safeMemories[0];

  // Locked capsules
  const lockedCapsules = safeCapsules.filter((c) => !c?.isUnlocked).slice(0, 2);

  // Pending bucket list
  const pendingBucketItems = safeBucketList.filter((b) => !b?.isCompleted).slice(0, 3);

  // Upcoming countdown
  const nextMilestone = safeCountdowns[0] || {
    title: 'Anniversary Trip to Paris',
    targetDate: '2026-10-15',
    category: 'Travel',
  };

  const getDaysLeft = (targetStr: string) => {
    if (!targetStr) return 0;
    const target = new Date(targetStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Find On This Day
  const today = new Date();
  const currentYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  const onThisDayMem = safeMemories.find((m) => {
    if (!m?.date) return false;
    const d = new Date(m.date);
    return d.getMonth() + 1 === todayMonth && d.getDate() === todayDate && d.getFullYear() < currentYear;
  }) || safeMemories.find((m) => m?.isFavorite && m.id !== featuredFavorite?.id) || safeMemories[1];

  const getYearOffsetLabel = (dateStr?: string) => {
    if (!dateStr) return 'From Our Vault';
    const mYear = new Date(dateStr).getFullYear();
    const diff = currentYear - mYear;
    if (diff <= 0) return 'Recent Moment';
    if (diff === 1) return '1 year ago';
    return `${diff} years ago`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 font-sans">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#DFBF99]/15 pb-4">
        <div>
          <span className="editorial-eyebrow text-[#DFBF99] block mb-1">Vault Overview</span>
          <h2 className="editorial-title text-3xl sm:text-4xl font-normal text-[#FAF7F2]">
            Chapters at a Glance
          </h2>
        </div>
        <button
          onClick={() => onNavigate('memories')}
          className="flex items-center gap-1.5 text-xs font-sans text-[#DFBF99] hover:text-[#FAF7F2] transition group"
        >
          <span>Open Full Vault</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Memories & Featured Favorite */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Favorite Memory */}
          {featuredFavorite && (
            <div className="rounded-2xl border border-[#DFBF99]/20 bg-[#1B0B1E]/85 p-6 sm:p-7 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#301135] border border-[#DFBF99]/25 text-[#DFBF99]">
                    <Heart className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-[#FAF7F2]">Cherished Favorite</h3>
                </div>
                <span className="text-[11px] font-mono text-[#DFBF99]">
                  {new Date(featuredFavorite.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>

              <div
                onClick={() => onViewMemory(featuredFavorite)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#DFBF99]/18 bg-[#240D28]/60 p-4 transition-all duration-300 hover:border-[#DFBF99]/40 hover:bg-[#301235]"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="h-44 sm:h-36 sm:w-48 shrink-0 overflow-hidden rounded-lg bg-[#2E1232]">
                    <img
                      src={featuredFavorite.photos?.[0] || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80'}
                      alt={featuredFavorite.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#DFBF99] font-medium font-sans">
                      {featuredFavorite.category} &bull; {featuredFavorite.mood}
                    </span>
                    <h4 className="font-serif text-2xl font-normal text-[#FAF7F2] mt-1 group-hover:text-[#EADFD5] transition-colors truncate">
                      {featuredFavorite.title}
                    </h4>
                    <p className="text-xs text-[#C9B7C3] mt-2 line-clamp-3 leading-relaxed font-normal">
                      &ldquo;{featuredFavorite.description}&rdquo;
                    </p>
                    {featuredFavorite.location && (
                      <span className="flex items-center gap-1 text-[11px] text-[#DFBF99]/90 mt-3 font-sans">
                        <MapPin className="h-3 w-3 text-[#DFBF99]" />
                        <span>{featuredFavorite.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Memories Strip */}
          <div className="rounded-2xl border border-[#DFBF99]/18 bg-[#1B0B1E]/85 p-6 sm:p-7 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#301135] border border-[#DFBF99]/25 text-[#DFBF99]">
                  <Camera className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#FAF7F2]">Recent Additions</h3>
              </div>
              <button
                onClick={onOpenAddMemory}
                className="flex items-center gap-1 text-xs font-sans text-[#DFBF99] hover:text-[#FAF7F2] transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Memory</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentMemories.map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => onViewMemory(mem)}
                  className="group flex flex-col rounded-xl border border-[#DFBF99]/15 bg-[#240D28]/60 p-3 transition hover:border-[#DFBF99]/35 hover:bg-[#301235] cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#2E1232] mb-2.5">
                    <img
                      src={mem.photos?.[0] || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80'}
                      alt={mem.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#DFBF99]">
                    {new Date(mem.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <h5 className="font-serif text-base font-normal text-[#FAF7F2] truncate group-hover:text-[#EADFD5] transition-colors mt-0.5">
                    {mem.title}
                  </h5>
                  <span className="text-[11px] text-[#C9B7C3] truncate">{mem.location || 'Moments of Us'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Countdown, Sealed Capsules, Future Dreams */}
        <div className="space-y-6">
          {/* Upcoming Countdown Card */}
          <div className="rounded-2xl border border-[#DFBF99]/20 bg-gradient-to-br from-[#2B1030]/90 to-[#18091B]/90 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#DFBF99]" />
                <span className="text-xs font-sans uppercase tracking-wider text-[#DFBF99] font-medium">Upcoming Milestone</span>
              </div>
              <button
                onClick={() => onNavigate('bucketlist')}
                className="text-xs font-sans text-[#C9B7C3] hover:text-[#FAF7F2] transition"
              >
                View
              </button>
            </div>

            <h4 className="font-serif text-2xl font-normal text-[#FAF7F2] mb-1">
              {nextMilestone.title}
            </h4>
            <span className="text-xs font-mono text-[#DFBF99] block mb-4">
              {new Date(nextMilestone.targetDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </span>

            <div className="flex items-baseline gap-2 rounded-xl border border-[#DFBF99]/20 bg-[#1B0B1E]/80 p-3.5">
              <span className="font-serif text-4xl font-normal text-[#DFBF99]">
                {getDaysLeft(nextMilestone.targetDate)}
              </span>
              <span className="text-xs text-[#C9B7C3] font-sans">days until this moment</span>
            </div>
          </div>

          {/* Sealed Time Capsules */}
          <div className="rounded-2xl border border-[#DFBF99]/18 bg-[#1B0B1E]/85 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#301135] border border-[#DFBF99]/25 text-[#DFBF99]">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-serif text-xl font-normal text-[#FAF7F2]">Sealed Capsules</h3>
              </div>
              <button
                id="dash-view-capsules"
                onClick={() => onNavigate('capsules')}
                className="text-xs font-sans text-[#DFBF99] hover:text-[#FAF7F2] transition"
              >
                View All
              </button>
            </div>

            {lockedCapsules.length > 0 ? (
              <div className="space-y-3">
                {lockedCapsules.map((cap) => (
                  <div
                    key={cap.id}
                    onClick={() => onNavigate('capsules')}
                    className="rounded-xl border border-[#DFBF99]/15 bg-[#240D28]/60 p-3.5 transition hover:border-[#DFBF99]/30 hover:bg-[#2F1132] cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs text-[#DFBF99] mb-1.5">
                      <span className="font-mono text-[10px] tracking-wide">Unlocks {cap.unlockDate}</span>
                      <Lock className="h-3 w-3 text-[#DFBF99]" />
                    </div>
                    <div className="font-serif text-base font-normal text-[#FAF7F2]">{cap.title}</div>
                    <div className="text-xs text-[#C9B7C3] line-clamp-1 mt-0.5">{cap.theme}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#C9B7C3] italic">No locked capsules at the moment.</p>
            )}
          </div>

          {/* Bucket List Next Adventures */}
          <div className="rounded-2xl border border-[#DFBF99]/18 bg-[#1B0B1E]/85 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#301135] border border-[#DFBF99]/25 text-[#DFBF99]">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-serif text-xl font-normal text-[#FAF7F2]">Future Dreams</h3>
              </div>
              <button
                id="dash-view-bucketlist"
                onClick={() => onNavigate('bucketlist')}
                className="text-xs font-sans text-[#DFBF99] hover:text-[#FAF7F2] transition"
              >
                Bucket List
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingBucketItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('bucketlist')}
                  className="flex items-start gap-2.5 rounded-lg border border-[#DFBF99]/15 bg-[#240D28]/45 p-3 transition hover:border-[#DFBF99]/30 hover:bg-[#301235] cursor-pointer"
                >
                  <div className="mt-0.5 h-3.5 w-3.5 rounded-full border border-[#DFBF99]/50" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-sans font-medium text-[#FAF7F2] truncate">{item.title}</p>
                    <span className="text-[10px] text-[#A896A4] uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
