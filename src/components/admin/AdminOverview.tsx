import React from 'react';
import { motion } from 'motion/react';
import { 
  Memory, 
  TimelineEvent, 
  PlaceMemory, 
  FutureLetter, 
  MemoryCapsule, 
  BucketListItem, 
  CountdownEvent, 
  SpecialDate, 
  AuditLogEntry 
} from '../../types';
import { 
  Sparkles, 
  Camera, 
  Calendar, 
  Mail, 
  Box, 
  MapPin, 
  ListTodo, 
  Clock, 
  Heart, 
  Star, 
  Plus, 
  ShieldCheck, 
  Database, 
  Activity, 
  ArrowUpRight,
  TrendingUp,
  Layers,
  ChevronRight
} from 'lucide-react';

interface AdminOverviewProps {
  memories: Memory[];
  timeline: TimelineEvent[];
  places: PlaceMemory[];
  letters: FutureLetter[];
  capsules: MemoryCapsule[];
  bucketList: BucketListItem[];
  countdowns: CountdownEvent[];
  specialDates: SpecialDate[];
  activityLogs: AuditLogEntry[];
  isSupabaseLive: boolean;
  onNavigateSection: (section: string) => void;
  onQuickAdd: (entity: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  memories,
  timeline,
  places,
  letters,
  capsules,
  bucketList,
  countdowns,
  specialDates,
  activityLogs,
  isSupabaseLive,
  onNavigateSection,
  onQuickAdd,
}) => {
  const totalMemories = memories.length;
  const totalPhotos = memories.reduce((acc, m) => acc + (m.photos?.length || 0), 0) +
    places.reduce((acc, p) => acc + (p.photos?.length || 0), 0) +
    timeline.filter(t => Boolean(t.photoUrl)).length;
  const totalMilestones = timeline.length;
  const totalLetters = letters.length;
  const totalCapsules = capsules.length;
  const totalPlaces = places.length;
  const totalBucketItems = bucketList.length;
  const completedBucketItems = bucketList.filter(b => b.isCompleted).length;
  const totalCountdowns = countdowns.length;
  const totalSpecialDates = specialDates.length;
  const totalFavorites = memories.filter(m => m.isFavorite).length;

  const statCards = [
    {
      title: 'Total Memories',
      value: totalMemories,
      subtext: `${totalFavorites} marked as favorite`,
      icon: Sparkles,
      color: 'from-amber-500/20 to-amber-700/10 text-amber-300 border-amber-500/20',
      section: 'memories',
    },
    {
      title: 'Archived Photos',
      value: totalPhotos,
      subtext: 'High-res couple moments',
      icon: Camera,
      color: 'from-rose-500/20 to-rose-700/10 text-rose-300 border-rose-500/20',
      section: 'media',
    },
    {
      title: 'Timeline Milestones',
      value: totalMilestones,
      subtext: 'Story chapters documented',
      icon: Calendar,
      color: 'from-purple-500/20 to-purple-700/10 text-purple-300 border-purple-500/20',
      section: 'timeline',
    },
    {
      title: 'Future Letters',
      value: totalLetters,
      subtext: `${letters.filter(l => !l.isOpened).length} sealed for later`,
      icon: Mail,
      color: 'from-indigo-500/20 to-indigo-700/10 text-indigo-300 border-indigo-500/20',
      section: 'letters',
    },
    {
      title: 'Memory Capsules',
      value: totalCapsules,
      subtext: `${capsules.filter(c => c.isSealed).length} locked until unlock date`,
      icon: Box,
      color: 'from-pink-500/20 to-pink-700/10 text-pink-300 border-pink-500/20',
      section: 'capsules',
    },
    {
      title: 'Atlas Places',
      value: totalPlaces,
      subtext: `${places.filter(p => p.isVisited).length} visited, ${places.filter(p => !p.isVisited).length} dream`,
      icon: MapPin,
      color: 'from-emerald-500/20 to-emerald-700/10 text-emerald-300 border-emerald-500/20',
      section: 'places',
    },
    {
      title: 'Bucket List Items',
      value: totalBucketItems,
      subtext: `${completedBucketItems} dreams fulfilled (${Math.round((completedBucketItems / (totalBucketItems || 1)) * 100)}%)`,
      icon: ListTodo,
      color: 'from-teal-500/20 to-teal-700/10 text-teal-300 border-teal-500/20',
      section: 'bucketlist',
    },
    {
      title: 'Countdowns',
      value: totalCountdowns,
      subtext: 'Upcoming dates & trips',
      icon: Clock,
      color: 'from-blue-500/20 to-blue-700/10 text-blue-300 border-blue-500/20',
      section: 'countdowns',
    },
    {
      title: 'Special Dates',
      value: totalSpecialDates,
      subtext: 'Anniversaries & milestones',
      icon: Heart,
      color: 'from-red-500/20 to-red-700/10 text-red-300 border-red-500/20',
      section: 'special_dates',
    },
  ];

  const quickActions = [
    { label: 'Add Memory', entity: 'Memory', icon: Sparkles },
    { label: 'Add Milestone', entity: 'Milestone', icon: Calendar },
    { label: 'Write Letter', entity: 'Letter', icon: Mail },
    { label: 'New Capsule', entity: 'Capsule', icon: Box },
    { label: 'Pin Place', entity: 'Place', icon: MapPin },
    { label: 'Add Wish', entity: 'BucketItem', icon: ListTodo },
    { label: 'New Countdown', entity: 'Countdown', icon: Clock },
    { label: 'Add Special Date', entity: 'SpecialDate', icon: Heart },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with System Status */}
      <div className="relative overflow-hidden rounded-2xl border border-[#DFBF99]/25 bg-gradient-to-r from-[#2A0E2C]/90 via-[#1C0A20]/95 to-[#160618]/90 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#DFBF99]">
                Production Vault Active
              </span>
              <span className="text-xs text-[#8F7D8A]">&bull;</span>
              <span className="text-xs font-mono text-[#D4C3B7]">
                Storage Mode: {isSupabaseLive ? 'Supabase Cloud RLS' : 'Local Encrypted Storage (Ready to Sync)'}
              </span>
            </div>
            <h1 className="editorial-title text-3xl sm:text-4xl text-[#FAF7F2] font-normal tracking-tight">
              Vault Administration
            </h1>
            <p className="mt-1 text-sm text-[#C9B7C3] max-w-2xl font-sans">
              Centralized administrative controls for Dear Us: curate memories, manage locked time capsules, write sealed future letters, monitor storage quotas, and customize live homepage presentations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateSection('cms')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/30 bg-[#351239] px-4 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#46174B] transition shadow-md"
            >
              <Layers className="h-4 w-4 text-[#DFBF99]" />
              <span>Edit Homepage CMS</span>
            </button>
            <button
              onClick={() => onNavigateSection('security')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/20 bg-[#1D0820] px-4 py-2.5 text-xs font-medium text-[#DFBF99] hover:bg-[#280D2D] transition"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>RLS &amp; Security</span>
            </button>
          </div>
        </div>

        {/* Quick Add Bar */}
        <div className="mt-6 pt-6 border-t border-[#DFBF99]/15">
          <p className="text-xs font-mono uppercase tracking-wider text-[#C9B7C3] mb-3">
            Quick Add Records
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {quickActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.label}
                  onClick={() => onQuickAdd(act.entity)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFBF99]/20 bg-[#250D29]/70 px-3 py-1.5 text-xs font-medium text-[#FAF7F2] hover:border-[#DFBF99]/50 hover:bg-[#34133A] active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5 text-[#DFBF99]" />
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#DFBF99]">
            Key Vault Metrics
          </h2>
          <span className="text-xs text-[#8F7D8A]">Click card to inspect records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => onNavigateSection(card.section)}
                className="group cursor-pointer relative overflow-hidden rounded-xl border border-[#DFBF99]/20 bg-gradient-to-b from-[#1F0C23]/80 to-[#150617]/90 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#DFBF99]/50 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-black/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-sans text-[#C9B7C3] group-hover:text-[#FAF7F2] transition">
                      {card.title}
                    </span>
                    <div className="mt-1 text-3xl font-mono font-medium text-[#FAF7F2] tracking-tight">
                      {card.value}
                    </div>
                    <div className="mt-1.5 text-xs text-[#8F7D8A]">
                      {card.subtext}
                    </div>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.color} bg-gradient-to-br transition group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#DFBF99]/10 text-[11px] text-[#DFBF99]/80 font-mono">
                  <span>Manage Collection</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Lower Section: Recent Activity & System Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#DFBF99]/20 bg-[#1A0A1D]/80 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#DFBF99]" />
              <h3 className="text-sm font-mono uppercase tracking-wider text-[#FAF7F2]">
                Recent Administrative Activity
              </h3>
            </div>
            <button
              onClick={() => onNavigateSection('activity')}
              className="text-xs font-mono text-[#DFBF99] hover:underline flex items-center gap-1"
            >
              <span>Full Audit Trail</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 5).map((log) => {
              const actionBadgeColor = 
                log.action === 'create' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40' :
                log.action === 'update' ? 'bg-blue-950/60 text-blue-300 border-blue-700/40' :
                log.action === 'delete' ? 'bg-rose-950/60 text-rose-300 border-rose-700/40' :
                'bg-amber-950/60 text-amber-300 border-amber-700/40';

              return (
                <div 
                  key={log.id} 
                  className="flex items-start justify-between gap-3 rounded-xl border border-[#DFBF99]/10 bg-[#120514]/60 p-3.5 text-xs transition hover:border-[#DFBF99]/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${actionBadgeColor}`}>
                        {log.action}
                      </span>
                      <span className="font-semibold text-[#FAF7F2]">{log.entity}</span>
                      {log.entityTitle && (
                        <span className="text-[#C9B7C3] truncate max-w-[200px] sm:max-w-[320px]">
                          &ldquo;{log.entityTitle}&rdquo;
                        </span>
                      )}
                    </div>
                    <p className="text-[#8F7D8A] font-sans text-[11px] leading-relaxed">
                      {log.summary}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] text-[#8F7D8A] block">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-[#DFBF99]/90 font-medium">
                      {log.adminUser}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health & Status (1 col) */}
        <div className="rounded-2xl border border-[#DFBF99]/20 bg-[#1A0A1D]/80 p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#DFBF99]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#FAF7F2]">
              Vault Engine
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-[#DFBF99]/15 bg-[#120514]/60 p-3">
              <div className="text-[#C9B7C3] mb-1 font-sans">Database Provider</div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-[#FAF7F2]">
                  {isSupabaseLive ? 'Supabase Cloud PostgreSQL' : 'Local Encrypted Cache'}
                </span>
                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold ${
                  isSupabaseLive 
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/40' 
                    : 'bg-amber-950/60 text-amber-300 border border-amber-700/40'
                }`}>
                  {isSupabaseLive ? 'CONNECTED' : 'STANDALONE'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[#DFBF99]/15 bg-[#120514]/60 p-3">
              <div className="text-[#C9B7C3] mb-1 font-sans">Row Level Security (RLS)</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#FAF7F2]">Enforced at Schema</span>
                <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#DFBF99]/15 bg-[#120514]/60 p-3">
              <div className="text-[#C9B7C3] mb-1 font-sans">Admin Role Enforcement</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#FAF7F2]">Protected via /admin Guard</span>
                <span className="text-[10px] font-mono text-emerald-400">ENABLED</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DFBF99]/15">
            <button
              onClick={() => onNavigateSection('security')}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#DFBF99]/30 bg-[#260C2A] py-2.5 text-xs font-medium text-[#DFBF99] hover:bg-[#38133E] transition"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>View RLS SQL &amp; Backup Vault</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
