import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Memory, 
  TimelineEvent, 
  PlaceMemory, 
  FutureLetter, 
  MemoryCapsule, 
  BucketListItem, 
  CountdownEvent, 
  SpecialDate, 
  HomepageCms, 
  CategoryItem, 
  MoodItem, 
  AuditLogEntry, 
  AdminMediaItem 
} from '../../types';
import { vaultStorage } from '../../services/vaultStorage';
import { isSupabaseConfigured } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

// Admin Subcomponents
import { AdminOverview } from './AdminOverview';
import { AdminMemories } from './AdminMemories';
import { AdminTimeline } from './AdminTimeline';
import { AdminLetters } from './AdminLetters';
import { AdminCapsules } from './AdminCapsules';
import { AdminPlaces } from './AdminPlaces';
import { AdminBucketList } from './AdminBucketList';
import { AdminCountdowns } from './AdminCountdowns';
import { AdminSpecialDates } from './AdminSpecialDates';
import { AdminMediaLibrary } from './AdminMediaLibrary';
import { AdminCategoriesMoods } from './AdminCategoriesMoods';
import { AdminHomepageCms } from './AdminHomepageCms';
import { AdminThemeSettings } from './AdminThemeSettings';
import { AdminActivityLog } from './AdminActivityLog';
import { AdminSecurity } from './AdminSecurity';
import { AdminSettings } from './AdminSettings';

// Icons
import { 
  LayoutDashboard, 
  Heart, 
  Clock, 
  Mail, 
  Box, 
  MapPin, 
  ListTodo, 
  Timer, 
  CalendarHeart, 
  Camera, 
  Tags, 
  FileText, 
  Palette, 
  Activity, 
  ShieldCheck, 
  Settings, 
  ArrowLeft, 
  Search, 
  Bell, 
  Menu, 
  X, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
  onExitAdmin: () => void;
}

export type AdminSection = 
  | 'overview'
  | 'memories'
  | 'timeline'
  | 'letters'
  | 'capsules'
  | 'places'
  | 'bucketlist'
  | 'countdowns'
  | 'special-dates'
  | 'media'
  | 'categories-moods'
  | 'cms'
  | 'theme'
  | 'activity'
  | 'security'
  | 'settings';

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  category: 'core' | 'content' | 'config';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExitAdmin }) => {
  const { user, profile, role, switchRole, isAdmin, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Core Data Collections
  const [memories, setMemories] = useState<Memory[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [places, setPlaces] = useState<PlaceMemory[]>([]);
  const [letters, setLetters] = useState<FutureLetter[]>([]);
  const [capsules, setCapsules] = useState<MemoryCapsule[]>([]);
  const [bucketList, setBucketList] = useState<BucketListItem[]>([]);
  const [countdowns, setCountdowns] = useState<CountdownEvent[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [homepageCms, setHomepageCms] = useState<HomepageCms>({
    heroHeading: 'Dear Us',
    tagline: 'A private vault of our shared journey',
    introText: 'Every chapter, unscripted laugh, and quiet dusk we spent together.',
    showStats: true,
    showOnThisDay: true,
    showUpcomingCountdown: true,
    enterStoryCta: 'Enter Our Story',
    addMemoryCta: 'Add a Memory',
    rediscoverCta: 'Rediscover',
    updatedAt: new Date().toISOString(),
  });
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [moods, setMoods] = useState<MoodItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<AuditLogEntry[]>([]);
  const [mediaList, setMediaList] = useState<AdminMediaItem[]>([]);

  const isSupabaseLive = isSupabaseConfigured();

  // Load all admin data
  const loadAllAdminData = async () => {
    try {
      const [
        mems,
        tls,
        plcs,
        ltrs,
        caps,
        bck,
        cds,
        sds,
        cms,
        cats,
        mds,
        logs,
        meds
      ] = await Promise.all([
        vaultStorage.getMemories(),
        vaultStorage.getTimeline(),
        vaultStorage.getPlaces(),
        vaultStorage.getLetters(),
        vaultStorage.getCapsules(),
        vaultStorage.getBucketList(),
        vaultStorage.getCountdowns(),
        vaultStorage.getSpecialDates(),
        vaultStorage.getHomepageCms(),
        vaultStorage.getCategories(),
        vaultStorage.getMoods(),
        vaultStorage.getActivityLogs(),
        vaultStorage.getMediaLibrary(),
      ]);

      setMemories(mems);
      setTimeline(tls);
      setPlaces(plcs);
      setLetters(ltrs);
      setCapsules(caps);
      setBucketList(bck);
      setCountdowns(cds);
      setSpecialDates(sds);
      setHomepageCms(cms);
      setCategories(cats);
      setMoods(mds);
      setActivityLogs(logs);
      setMediaList(meds);
    } catch (err) {
      console.error('Failed to load admin collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Helper to record audit activity
  const recordAudit = async (
    action: 'create' | 'update' | 'delete' | 'config' | 'reorder',
    entity: AuditLogEntry['entity'],
    entityId: string | undefined,
    entityTitle: string | undefined,
    summary: string
  ) => {
    try {
      await vaultStorage.addActivityLog({
        action,
        entity,
        entityId,
        entityTitle,
        adminUser: profile?.name || user?.name || 'Administrator',
        summary,
      });
      const updatedLogs = await vaultStorage.getActivityLogs();
      setActivityLogs(updatedLogs);
    } catch (err) {
      console.warn('Failed to record audit log:', err);
    }
  };

  // CRUD Handlers
  // 1. Memories
  const handleSaveMemory = async (mem: Memory) => {
    const isNew = !memories.some(m => m.id === mem.id);
    await vaultStorage.saveMemory(mem);
    const updated = await vaultStorage.getMemories();
    setMemories(updated);
    await recordAudit(
      isNew ? 'create' : 'update',
      'Memory',
      mem.id,
      mem.title,
      `${isNew ? 'Created' : 'Updated'} memory "${mem.title}" (${mem.date})`
    );
  };

  const handleDeleteMemory = async (id: string) => {
    const target = memories.find(m => m.id === id);
    await vaultStorage.deleteMemory(id);
    setMemories(prev => prev.filter(m => m.id !== id));
    await recordAudit(
      'delete',
      'Memory',
      id,
      target?.title,
      `Deleted memory "${target?.title || id}"`
    );
  };

  // 2. Timeline
  const handleSaveTimeline = async (ev: TimelineEvent) => {
    const isNew = !timeline.some(t => t.id === ev.id);
    await vaultStorage.saveTimelineEvent(ev);
    const updated = await vaultStorage.getTimeline();
    setTimeline(updated);
    await recordAudit(
      isNew ? 'create' : 'update',
      'Timeline',
      ev.id,
      ev.title,
      `${isNew ? 'Added milestone' : 'Updated milestone'} "${ev.title}"`
    );
  };

  const handleDeleteTimeline = async (id: string) => {
    const target = timeline.find(t => t.id === id);
    await vaultStorage.deleteTimelineEvent(id);
    setTimeline(prev => prev.filter(t => t.id !== id));
    await recordAudit('delete', 'Timeline', id, target?.title, `Deleted milestone "${target?.title || id}"`);
  };

  // 3. Letters
  const handleSaveLetter = async (ltr: FutureLetter) => {
    const isNew = !letters.some(l => l.id === ltr.id);
    await vaultStorage.saveLetter(ltr);
    const updated = await vaultStorage.getLetters();
    setLetters(updated);
    await recordAudit(
      isNew ? 'create' : 'update',
      'Letter',
      ltr.id,
      ltr.title,
      `${isNew ? 'Sealed new future letter' : 'Modified letter'} "${ltr.title}" for ${ltr.recipientName}`
    );
  };

  const handleDeleteLetter = async (id: string) => {
    const target = letters.find(l => l.id === id);
    await vaultStorage.deleteLetter(id);
    setLetters(prev => prev.filter(l => l.id !== id));
    await recordAudit('delete', 'Letter', id, target?.title, `Deleted future letter "${target?.title || id}"`);
  };

  // 4. Capsules
  const handleSaveCapsule = async (cap: MemoryCapsule) => {
    const isNew = !capsules.some(c => c.id === cap.id);
    await vaultStorage.saveCapsule(cap);
    const updated = await vaultStorage.getCapsules();
    setCapsules(updated);
    await recordAudit(
      isNew ? 'create' : 'update',
      'Capsule',
      cap.id,
      cap.title,
      `${isNew ? 'Locked time capsule' : 'Updated capsule'} "${cap.title}" (Unlocks: ${cap.unlockDate})`
    );
  };

  const handleDeleteCapsule = async (id: string) => {
    const target = capsules.find(c => c.id === id);
    await vaultStorage.deleteCapsule(id);
    setCapsules(prev => prev.filter(c => c.id !== id));
    await recordAudit('delete', 'Capsule', id, target?.title, `Deleted memory capsule "${target?.title || id}"`);
  };

  // 5. Places
  const handleSavePlace = async (place: PlaceMemory) => {
    const isNew = !places.some(p => p.id === place.id);
    await vaultStorage.savePlace(place);
    const updated = await vaultStorage.getPlaces();
    setPlaces(updated);
    await recordAudit(
      isNew ? 'create' : 'update',
      'Place',
      place.id,
      place.name,
      `${isNew ? 'Pinned new place' : 'Updated atlas location'} "${place.name}" (${place.location})`
    );
  };

  const handleDeletePlace = async (id: string) => {
    const target = places.find(p => p.id === id);
    await vaultStorage.deletePlace(id);
    setPlaces(prev => prev.filter(p => p.id !== id));
    await recordAudit('delete', 'Place', id, target?.name, `Removed place pin "${target?.name || id}"`);
  };

  // 6. Bucket List
  const handleSaveBucketItem = async (item: BucketListItem) => {
    const isNew = !bucketList.some(b => b.id === item.id);
    await vaultStorage.saveBucketItem(item);
    const updated = await vaultStorage.getBucketList();
    setBucketList(updated);
    await recordAudit(
      isNew ? 'create' : 'update',
      'BucketList',
      item.id,
      item.title,
      `${isNew ? 'Added dream to bucket list' : 'Updated bucket item'} "${item.title}"`
    );
  };

  const handleDeleteBucketItem = async (id: string) => {
    const target = bucketList.find(b => b.id === id);
    await vaultStorage.deleteBucketItem(id);
    setBucketList(prev => prev.filter(b => b.id !== id));
    await recordAudit('delete', 'BucketList', id, target?.title, `Deleted dream item "${target?.title || id}"`);
  };

  // 7. Countdowns
  const handleSaveCountdown = async (cd: CountdownEvent) => {
    const isNew = !countdowns.some(c => c.id === cd.id);
    await vaultStorage.saveCountdown(cd);
    const updated = await vaultStorage.getCountdowns();
    setCountdowns(updated);
    await recordAudit(
      isNew ? 'create' : 'update',
      'Countdown',
      cd.id,
      cd.title,
      `${isNew ? 'Created countdown' : 'Updated countdown'} "${cd.title}" towards ${cd.targetDate}`
    );
  };

  const handleDeleteCountdown = async (id: string) => {
    const target = countdowns.find(c => c.id === id);
    await vaultStorage.deleteCountdown(id);
    setCountdowns(prev => prev.filter(c => c.id !== id));
    await recordAudit('delete', 'Countdown', id, target?.title, `Deleted countdown "${target?.title || id}"`);
  };

  // 8. Special Dates
  const handleSaveSpecialDate = async (date: SpecialDate) => {
    const isNew = !specialDates.some(d => d.id === date.id);
    await vaultStorage.saveSpecialDate(date);
    const updated = await vaultStorage.getSpecialDates();
    setSpecialDates(updated);
    await recordAudit(
      isNew ? 'create' : 'update',
      'SpecialDate',
      date.id,
      date.title,
      `${isNew ? 'Recorded anniversary' : 'Updated special date'} "${date.title}" (${date.date})`
    );
  };

  const handleDeleteSpecialDate = async (id: string) => {
    const target = specialDates.find(d => d.id === id);
    await vaultStorage.deleteSpecialDate(id);
    setSpecialDates(prev => prev.filter(d => d.id !== id));
    await recordAudit('delete', 'SpecialDate', id, target?.title, `Deleted milestone date "${target?.title || id}"`);
  };

  // 9. Media
  const handleUploadMedia = async (item: AdminMediaItem) => {
    await vaultStorage.saveMediaItem(item);
    const updated = await vaultStorage.getMediaLibrary();
    setMediaList(updated);
    await recordAudit('create', 'Vault', item.id, item.fileName || item.name, `Uploaded photo asset "${item.fileName || item.name}"`);
  };

  const handleReplaceMedia = async (oldUrl: string, newUrl: string) => {
    const result = await vaultStorage.replaceMediaUrl(oldUrl, newUrl);
    await loadAllAdminData();
    await recordAudit(
      'update',
      'Vault',
      undefined,
      'Photo Replacement',
      `Globally replaced image asset across ${result.affectedCount} vault records`
    );
  };

  const handleDeleteMedia = async (id: string, url: string) => {
    await vaultStorage.deleteMediaItem(id);
    const updated = await vaultStorage.getMediaLibrary();
    setMediaList(updated);
    await recordAudit('delete', 'Vault', id, 'Media Asset', `Deleted photo asset from vault library`);
  };

  // 10. Categories & Moods
  const handleSaveCategory = async (cat: CategoryItem) => {
    const isNew = !categories.some(c => c.id === cat.id);
    await vaultStorage.saveCategory(cat);
    const updated = await vaultStorage.getCategories();
    setCategories(updated);
    await recordAudit(isNew ? 'create' : 'update', 'Category', cat.id, cat.name, `${isNew ? 'Created' : 'Updated'} category "${cat.name}"`);
  };

  const handleDeleteCategory = async (id: string, reassignToId?: string) => {
    const target = categories.find(c => c.id === id);
    await vaultStorage.deleteCategory(id, reassignToId);
    await loadAllAdminData();
    await recordAudit('delete', 'Category', id, target?.name, `Deleted category "${target?.name}" (Reassigned to ${reassignToId || 'default'})`);
  };

  const handleSaveMood = async (mood: MoodItem) => {
    const isNew = !moods.some(m => m.id === mood.id);
    await vaultStorage.saveMood(mood);
    const updated = await vaultStorage.getMoods();
    setMoods(updated);
    await recordAudit(isNew ? 'create' : 'update', 'Mood', mood.id, mood.name, `${isNew ? 'Created' : 'Updated'} mood "${mood.emoji} ${mood.name}"`);
  };

  const handleDeleteMood = async (id: string, reassignToId?: string) => {
    const target = moods.find(m => m.id === id);
    await vaultStorage.deleteMood(id, reassignToId);
    await loadAllAdminData();
    await recordAudit('delete', 'Mood', id, target?.name, `Deleted mood "${target?.name}"`);
  };

  // 11. Homepage CMS
  const handleSaveCms = async (newCms: HomepageCms) => {
    await vaultStorage.saveHomepageCms(newCms);
    setHomepageCms(newCms);
    await recordAudit('config', 'HomepageCMS', undefined, newCms.heroHeading, `Updated homepage hero heading and showcase layout`);
  };

  // 12. Logs
  const handleClearLogs = async () => {
    await vaultStorage.clearActivityLogs();
    setActivityLogs([]);
  };

  // 13. Backup & Reset
  const handleExportBackup = async () => {
    const json = await vaultStorage.exportVaultJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dearus-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    await recordAudit('config', 'Vault', undefined, 'Backup Export', 'Generated full JSON cryptographic backup of vault archive');
  };

  const handleImportBackup = async (jsonStr: string) => {
    const success = await vaultStorage.restoreVaultJson(jsonStr);
    if (success) {
      await loadAllAdminData();
      await recordAudit('config', 'Vault', undefined, 'Backup Restore', 'Restored vault database archive from JSON backup');
    }
    return success;
  };

  const handleResetVault = async () => {
    vaultStorage.resetToDemo();
    await loadAllAdminData();
    await recordAudit('config', 'Vault', undefined, 'Archive Reset', 'Reset vault to original curated demo archive');
  };

  // Navigation Items
  const NAV_ITEMS: NavItem[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, category: 'core' },
    { id: 'memories', label: 'Memories Vault', icon: Heart, badge: memories.length, category: 'content' },
    { id: 'timeline', label: 'Milestones & Timeline', icon: Clock, badge: timeline.length, category: 'content' },
    { id: 'letters', label: 'Future Letters', icon: Mail, badge: letters.length, category: 'content' },
    { id: 'capsules', label: 'Memory Capsules', icon: Box, badge: capsules.length, category: 'content' },
    { id: 'places', label: 'Places & Atlas', icon: MapPin, badge: places.length, category: 'content' },
    { id: 'bucketlist', label: 'Bucket List Dreams', icon: ListTodo, badge: bucketList.length, category: 'content' },
    { id: 'countdowns', label: 'Upcoming Countdowns', icon: Timer, badge: countdowns.length, category: 'content' },
    { id: 'special-dates', label: 'Anniversaries & Dates', icon: CalendarHeart, badge: specialDates.length, category: 'content' },
    { id: 'media', label: 'Media & Photo Vault', icon: Camera, badge: mediaList.length || 'All', category: 'content' },
    { id: 'categories-moods', label: 'Categories & Moods', icon: Tags, badge: categories.length + moods.length, category: 'content' },
    { id: 'cms', label: 'Homepage CMS Editor', icon: FileText, category: 'config' },
    { id: 'theme', label: 'Theme & Appearance', icon: Palette, category: 'config' },
    { id: 'activity', label: 'Audit Activity Logs', icon: Activity, badge: activityLogs.length, category: 'config' },
    { id: 'security', label: 'Security & RLS Rules', icon: ShieldCheck, category: 'config' },
    { id: 'settings', label: 'Vault Configuration', icon: Settings, category: 'config' },
  ];

  const currentNav = NAV_ITEMS.find(n => n.id === activeSection);

  return (
    <div className="min-h-screen bg-[#110413] text-[#FAF7F2] flex flex-col font-sans selection:bg-[#7D2146] selection:text-white">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 border-b border-[#DFBF99]/20 bg-[#17071A]/95 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden rounded-lg p-2 text-[#DFBF99] hover:bg-[#2A0F2E] transition"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFBF99]/20 bg-[#250C28] px-2.5 py-1.5 text-xs text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition shrink-0"
            title="Return to Public Story Experience"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#DFBF99]" />
            <span className="hidden sm:inline">Return to Story</span>
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8F7D8A]">
            <span>Vault Admin</span>
            <ChevronRight className="h-3.5 w-3.5 text-[#DFBF99]/50" />
            <span className="text-[#FAF7F2] font-medium">{currentNav?.label || 'Overview'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-mono text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isSupabaseLive ? 'Supabase RLS Active' : 'Encrypted Vault'}</span>
          </div>

          {/* Partner Persona Badge */}
          <div className="flex items-center gap-2 rounded-xl border border-[#DFBF99]/20 bg-[#220B26] py-1 px-2.5 text-xs">
            <div className="h-6 w-6 rounded-full bg-[#7D2146] text-[#FAF7F2] flex items-center justify-center font-serif text-xs">
              {(profile?.name || user?.name || 'E')[0]}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="font-medium text-[#FAF7F2] text-[11px] truncate max-w-[120px]">{profile?.name || user?.name || 'Elena Vance'}</div>
              <div className="text-[9px] font-mono text-[#DFBF99] uppercase">Admin Role</div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={async () => {
              await logout();
              onExitAdmin();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFBF99]/20 bg-[#250C29] px-2.5 py-1.5 text-xs text-[#C9B7C3] hover:text-rose-300 hover:border-rose-500/40 hover:bg-rose-950/20 transition"
            title="Sign out of Administrator Session"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-[#DFBF99]/20 bg-[#160618]/98 p-4 backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0 overflow-y-auto flex flex-col justify-between ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            {/* Logo / Heading */}
            <div className="px-2 pt-1 pb-3 border-b border-[#DFBF99]/15">
              <div className="flex items-center gap-2 text-[#DFBF99]">
                <Sparkles className="h-4 w-4" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#DFBF99]">Dear Us Admin</span>
              </div>
              <p className="text-[11px] text-[#8F7D8A] mt-1 font-sans">
                Curated Administration Console
              </p>
            </div>

            {/* Nav Groups */}
            <div className="space-y-5">
              {/* Core */}
              <div>
                <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#DFBF99]/60 mb-2">
                  Console
                </div>
                <div className="space-y-1">
                  {NAV_ITEMS.filter(n => n.category === 'core').map(item => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                          isActive
                            ? 'bg-gradient-to-r from-[#7D2146] to-[#5C1632] text-[#FAF7F2] shadow-md border border-[#DFBF99]/30'
                            : 'text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250C29]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-[#DFBF99]' : 'text-[#8F7D8A]'}`} />
                          <span>{item.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Collections */}
              <div>
                <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#DFBF99]/60 mb-2">
                  Memory Collections
                </div>
                <div className="space-y-1">
                  {NAV_ITEMS.filter(n => n.category === 'content').map(item => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                          isActive
                            ? 'bg-gradient-to-r from-[#7D2146] to-[#5C1632] text-[#FAF7F2] shadow-md border border-[#DFBF99]/30'
                            : 'text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250C29]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#DFBF99]' : 'text-[#8F7D8A]'}`} />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge !== undefined && (
                          <span className="rounded bg-[#2E0F33] px-1.5 py-0.5 text-[10px] font-mono text-[#DFBF99] shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Configuration */}
              <div>
                <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#DFBF99]/60 mb-2">
                  Configuration &amp; Security
                </div>
                <div className="space-y-1">
                  {NAV_ITEMS.filter(n => n.category === 'config').map(item => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                          isActive
                            ? 'bg-gradient-to-r from-[#7D2146] to-[#5C1632] text-[#FAF7F2] shadow-md border border-[#DFBF99]/30'
                            : 'text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250C29]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#DFBF99]' : 'text-[#8F7D8A]'}`} />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge !== undefined && (
                          <span className="rounded bg-[#2E0F33] px-1.5 py-0.5 text-[10px] font-mono text-[#DFBF99] shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DFBF99]/15 space-y-2">
            <button
              onClick={onExitAdmin}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#DFBF99]/30 bg-[#250C29] p-2.5 text-xs text-[#DFBF99] hover:bg-[#36133B] transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Exit Admin &amp; View Story</span>
            </button>
            <button
              onClick={async () => {
                await logout();
                onExitAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-2.5 text-xs text-rose-300 hover:bg-rose-950/40 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Backdrop on mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'overview' && (
              <AdminOverview
                memories={memories}
                timeline={timeline}
                places={places}
                letters={letters}
                capsules={capsules}
                bucketList={bucketList}
                countdowns={countdowns}
                specialDates={specialDates}
                activityLogs={activityLogs}
                isSupabaseLive={isSupabaseLive}
                onNavigateSection={(sec) => setActiveSection(sec as AdminSection)}
                onQuickAdd={(entity) => {
                  if (entity === 'memory') setActiveSection('memories');
                  else if (entity === 'milestone') setActiveSection('timeline');
                  else if (entity === 'letter') setActiveSection('letters');
                  else if (entity === 'capsule') setActiveSection('capsules');
                  else if (entity === 'place') setActiveSection('places');
                  else if (entity === 'bucket') setActiveSection('bucketlist');
                  else if (entity === 'countdown') setActiveSection('countdowns');
                  else if (entity === 'special-date') setActiveSection('special-dates');
                }}
              />
            )}

            {activeSection === 'memories' && (
              <AdminMemories
                memories={memories}
                categories={categories}
                moods={moods}
                onSaveMemory={handleSaveMemory}
                onDeleteMemory={handleDeleteMemory}
                currentUser={user?.id || 'partner-1'}
              />
            )}

            {activeSection === 'timeline' && (
              <AdminTimeline
                events={timeline}
                categories={categories}
                onSaveEvent={handleSaveTimeline}
                onDeleteEvent={handleDeleteTimeline}
                currentUser={user?.id || 'partner-1'}
              />
            )}

            {activeSection === 'letters' && (
              <AdminLetters
                letters={letters}
                onSaveLetter={handleSaveLetter}
                onDeleteLetter={handleDeleteLetter}
                currentUser={user?.id || 'partner-1'}
              />
            )}

            {activeSection === 'capsules' && (
              <AdminCapsules
                capsules={capsules}
                onSaveCapsule={handleSaveCapsule}
                onDeleteCapsule={handleDeleteCapsule}
                currentUser={user?.id || 'partner-1'}
              />
            )}

            {activeSection === 'places' && (
              <AdminPlaces
                places={places}
                onSavePlace={handleSavePlace}
                onDeletePlace={handleDeletePlace}
                currentUser={user?.id || 'partner-1'}
              />
            )}

            {activeSection === 'bucketlist' && (
              <AdminBucketList
                items={bucketList}
                categories={categories}
                onSaveItem={handleSaveBucketItem}
                onDeleteItem={handleDeleteBucketItem}
                currentUser={user?.id || 'partner-1'}
              />
            )}

            {activeSection === 'countdowns' && (
              <AdminCountdowns
                countdowns={countdowns}
                onSaveCountdown={handleSaveCountdown}
                onDeleteCountdown={handleDeleteCountdown}
                currentUser={user?.id || 'partner-1'}
              />
            )}

            {activeSection === 'special-dates' && (
              <AdminSpecialDates
                specialDates={specialDates}
                categories={categories}
                onSaveSpecialDate={handleSaveSpecialDate}
                onDeleteSpecialDate={handleDeleteSpecialDate}
                currentUser={user?.id || 'partner-1'}
              />
            )}

            {activeSection === 'media' && (
              <AdminMediaLibrary
                mediaList={mediaList}
                memories={memories}
                places={places}
                timeline={timeline}
                onUploadMedia={handleUploadMedia}
                onReplaceMedia={handleReplaceMedia}
                onDeleteMedia={handleDeleteMedia}
                currentUser={user?.id || 'partner-1'}
              />
            )}

            {activeSection === 'categories-moods' && (
              <AdminCategoriesMoods
                categories={categories}
                moods={moods}
                memories={memories}
                timeline={timeline}
                onSaveCategory={handleSaveCategory}
                onDeleteCategory={handleDeleteCategory}
                onSaveMood={handleSaveMood}
                onDeleteMood={handleDeleteMood}
              />
            )}

            {activeSection === 'cms' && (
              <AdminHomepageCms
                cms={homepageCms}
                memories={memories}
                timeline={timeline}
                onSaveCms={handleSaveCms}
              />
            )}

            {activeSection === 'theme' && (
              <AdminThemeSettings />
            )}

            {activeSection === 'activity' && (
              <AdminActivityLog
                logs={activityLogs}
                onClearLogs={handleClearLogs}
              />
            )}

            {activeSection === 'security' && (
              <AdminSecurity
                isSupabaseLive={isSupabaseLive}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                onResetVault={handleResetVault}
              />
            )}

            {activeSection === 'settings' && (
              <AdminSettings
                currentUser={user?.id || 'partner-1'}
                isAdmin={isAdmin}
                onToggleAdminRole={(val) => switchRole(val ? 'admin' : 'user')}
                onSwitchUser={(partnerId) => {
                  // Switch active user demo
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
