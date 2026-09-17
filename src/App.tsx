import React, { useState, useEffect } from 'react';
import { 
  ActiveTab, 
  Memory, 
  TimelineEvent, 
  PlaceMemory, 
  FutureLetter, 
  MemoryCapsule, 
  BucketListItem, 
  MilestoneCountdown,
  MemoryReaction
} from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { vaultStorage } from './services/vaultStorage';
import { demoMemories, demoTimeline, demoPlaces, demoLetters, demoCapsules, demoBucketList, demoCountdowns } from './data/demoData';

// Common Components
import { ParticleBackground } from './components/common/ParticleBackground';
import { AudioPlayer } from './components/common/AudioPlayer';
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';

// View Sections
import { HeroSection } from './components/home/HeroSection';
import { QuickDashboard } from './components/home/QuickDashboard';
import { StoryTimeline } from './components/timeline/StoryTimeline';
import { MemoryVault } from './components/memories/MemoryVault';
import { MemoryViewer } from './components/memories/MemoryViewer';
import { MemoryModal } from './components/memories/MemoryModal';
import { PlacesSection } from './components/places/PlacesSection';
import { LettersSection } from './components/letters/LettersSection';
import { CapsulesSection } from './components/capsules/CapsulesSection';
import { MemoryReplay } from './components/replay/MemoryReplay';
import { MemoryCalendar } from './components/calendar/MemoryCalendar';
import { BucketListSection } from './components/bucketlist/BucketListSection';
import { YearInMemories } from './components/year/YearInMemories';
import { SettingsSection } from './components/settings/SettingsSection';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';

function MainApp() {
  const { profile } = useAuth();
  const { currentTheme } = useTheme();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Application Data States
  const [memories, setMemories] = useState<Memory[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [places, setPlaces] = useState<PlaceMemory[]>([]);
  const [letters, setLetters] = useState<FutureLetter[]>([]);
  const [capsules, setCapsules] = useState<MemoryCapsule[]>([]);
  const [bucketList, setBucketList] = useState<BucketListItem[]>([]);
  const [countdowns, setCountdowns] = useState<MilestoneCountdown[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Viewer States
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [initialDateForMemory, setInitialDateForMemory] = useState<string | undefined>(undefined);

  // Load data from vaultStorage
  const loadVaultData = async () => {
    try {
      const [mems, tls, plcs, ltrs, caps, bck, cds] = await Promise.all([
        vaultStorage.getMemories(),
        vaultStorage.getTimeline(),
        vaultStorage.getPlaces(),
        vaultStorage.getLetters(),
        vaultStorage.getCapsules(),
        vaultStorage.getBucketList(),
        vaultStorage.getCountdowns(),
      ]);

      setMemories(mems);
      setTimeline(tls);
      setPlaces(plcs);
      setLetters(ltrs);
      setCapsules(caps);
      setBucketList(bck);
      setCountdowns(cds);
    } catch (err) {
      console.error('Failed to load vault data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaultData();
  }, []);

  // Sync URL routes (/admin, /admin/login, #admin)
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path === '/admin/login' || path.startsWith('/admin/') || hash === '#admin' || hash === '#/admin' || hash === '#/admin/login') {
        setActiveTab('admin');
      }
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // 1. Memories CRUD
  const handleSaveMemory = async (mem: Memory) => {
    await vaultStorage.saveMemory(mem);
    const updated = await vaultStorage.getMemories();
    setMemories(updated);
    if (selectedMemory?.id === mem.id) {
      setSelectedMemory(mem);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    await vaultStorage.deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
  };

  const handleToggleFavoriteMemory = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const mem = memories.find((m) => m.id === id);
    if (!mem) return;
    const updated = { ...mem, isFavorite: !mem.isFavorite };
    await handleSaveMemory(updated);
  };

  const handleAddReaction = async (memoryId: string, reaction: MemoryReaction) => {
    const mem = memories.find((m) => m.id === memoryId);
    if (!mem) return;
    const existing = mem.reactions || [];
    const updatedReactions = [...existing, reaction];
    const updatedMem = { ...mem, reactions: updatedReactions };
    await handleSaveMemory(updatedMem);
  };

  // Next / Prev Navigation inside Memory Viewer
  const handleNextMemory = () => {
    if (!selectedMemory || memories.length <= 1) return;
    const currentIndex = memories.findIndex((m) => m.id === selectedMemory.id);
    const nextIndex = (currentIndex + 1) % memories.length;
    setSelectedMemory(memories[nextIndex]);
  };

  const handlePrevMemory = () => {
    if (!selectedMemory || memories.length <= 1) return;
    const currentIndex = memories.findIndex((m) => m.id === selectedMemory.id);
    const prevIndex = (currentIndex - 1 + memories.length) % memories.length;
    setSelectedMemory(memories[prevIndex]);
  };

  // 2. Timeline CRUD
  const handleSaveTimelineEvent = async (event: TimelineEvent) => {
    await vaultStorage.saveTimelineEvent(event);
    const updated = await vaultStorage.getTimeline();
    setTimeline(updated);
  };

  const handleDeleteTimelineEvent = async (id: string) => {
    await vaultStorage.deleteTimelineEvent(id);
    setTimeline((prev) => prev.filter((t) => t.id !== id));
  };

  // 3. Places CRUD
  const handleSavePlace = async (place: PlaceMemory) => {
    await vaultStorage.savePlace(place);
    const updated = await vaultStorage.getPlaces();
    setPlaces(updated);
  };

  const handleDeletePlace = async (id: string) => {
    await vaultStorage.deletePlace(id);
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  // 4. Letters CRUD
  const handleSaveLetter = async (letter: FutureLetter) => {
    await vaultStorage.saveLetter(letter);
    const updated = await vaultStorage.getLetters();
    setLetters(updated);
  };

  const handleDeleteLetter = async (id: string) => {
    await vaultStorage.deleteLetter(id);
    setLetters((prev) => prev.filter((l) => l.id !== id));
  };

  // 5. Capsules CRUD
  const handleSaveCapsule = async (capsule: MemoryCapsule) => {
    await vaultStorage.saveCapsule(capsule);
    const updated = await vaultStorage.getCapsules();
    setCapsules(updated);
  };

  const handleDeleteCapsule = async (id: string) => {
    await vaultStorage.deleteCapsule(id);
    setCapsules((prev) => prev.filter((c) => c.id !== id));
  };

  // 6. Bucket List CRUD
  const handleSaveBucketItem = async (item: BucketListItem) => {
    await vaultStorage.saveBucketItem(item);
    const updated = await vaultStorage.getBucketList();
    setBucketList(updated);
  };

  const handleDeleteBucketItem = async (id: string) => {
    await vaultStorage.deleteBucketItem(id);
    setBucketList((prev) => prev.filter((b) => b.id !== id));
  };

  // 7. Countdowns CRUD
  const handleSaveCountdown = async (cd: MilestoneCountdown) => {
    await vaultStorage.saveCountdown(cd);
    const updated = await vaultStorage.getCountdowns();
    setCountdowns(updated);
  };

  const handleDeleteCountdown = async (id: string) => {
    await vaultStorage.deleteCountdown(id);
    setCountdowns((prev) => prev.filter((c) => c.id !== id));
  };

  // Reset to initial demo data
  const handleResetDemoData = () => {
    localStorage.clear();
    loadVaultData();
  };

  const openAddMemoryModal = (date?: string) => {
    setEditingMemory(null);
    setInitialDateForMemory(date);
    setMemoryModalOpen(true);
  };

  if (activeTab === 'admin') {
    return (
      <AdminRoute onReturnToHome={() => handleNavigate('home')}>
        <AdminLayout onExitAdmin={() => handleNavigate('home')} />
      </AdminRoute>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#120815] text-[#FAF4F7] flex flex-col font-sans transition-colors duration-500 relative selection:bg-[#8B264E] selection:text-white pb-20 md:pb-0 theme-${currentTheme}`}
    >
      {/* Subtle Cinematic Particle Background */}
      <ParticleBackground />

      {/* Top Desktop Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onNavigate={handleNavigate}
        onOpenAddMemory={() => openAddMemoryModal()}
        onStartReplay={() => handleNavigate('replay')}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'home' && (
          <div className="space-y-12">
            <HeroSection
              memories={memories}
              places={places}
              letters={letters}
              countdowns={countdowns}
              onNavigate={setActiveTab}
              onOpenAddMemory={() => openAddMemoryModal()}
              onOpenRandomMemory={() => {
                if (memories && memories.length > 0) {
                  const random = memories[Math.floor(Math.random() * memories.length)];
                  setSelectedMemory(random);
                }
              }}
              onViewMemory={setSelectedMemory}
            />
            <QuickDashboard
              memories={memories}
              capsules={capsules}
              bucketList={bucketList}
              countdowns={countdowns}
              onNavigate={setActiveTab}
              onViewMemory={setSelectedMemory}
              onOpenAddMemory={() => openAddMemoryModal()}
            />
          </div>
        )}

        {(activeTab === 'timeline' || activeTab === 'story') && (
          <StoryTimeline
            timeline={timeline}
            onSaveEvent={handleSaveTimelineEvent}
            onDeleteEvent={handleDeleteTimelineEvent}
          />
        )}

        {activeTab === 'memories' && (
          <MemoryVault
            memories={memories}
            onOpenAddModal={() => openAddMemoryModal()}
            onViewMemory={setSelectedMemory}
            onToggleFavorite={handleToggleFavoriteMemory}
          />
        )}

        {activeTab === 'places' && (
          <PlacesSection
            places={places}
            memories={memories}
            onSavePlace={handleSavePlace}
            onDeletePlace={handleDeletePlace}
            onViewMemory={setSelectedMemory}
          />
        )}

        {activeTab === 'letters' && (
          <LettersSection
            letters={letters}
            onSaveLetter={handleSaveLetter}
            onDeleteLetter={handleDeleteLetter}
          />
        )}

        {activeTab === 'capsules' && (
          <CapsulesSection
            capsules={capsules}
            onSaveCapsule={handleSaveCapsule}
            onDeleteCapsule={handleDeleteCapsule}
          />
        )}

        {activeTab === 'future' && (
          <div className="space-y-12 pb-12">
            <CapsulesSection
              capsules={capsules}
              onSaveCapsule={handleSaveCapsule}
              onDeleteCapsule={handleDeleteCapsule}
            />
            <LettersSection
              letters={letters}
              onSaveLetter={handleSaveLetter}
              onDeleteLetter={handleDeleteLetter}
            />
          </div>
        )}

        {activeTab === 'replay' && (
          <MemoryReplay
            memories={memories}
            onExit={() => setActiveTab('memories')}
          />
        )}

        {activeTab === 'calendar' && (
          <MemoryCalendar
            memories={memories}
            countdowns={countdowns}
            timeline={timeline}
            onViewMemory={setSelectedMemory}
            onOpenAddMemory={(date) => openAddMemoryModal(date)}
          />
        )}

        {activeTab === 'bucketlist' && (
          <BucketListSection
            bucketList={bucketList}
            countdowns={countdowns}
            memories={memories}
            onSaveBucketItem={handleSaveBucketItem}
            onDeleteBucketItem={handleDeleteBucketItem}
            onSaveCountdown={handleSaveCountdown}
            onDeleteCountdown={handleDeleteCountdown}
            onViewMemory={setSelectedMemory}
          />
        )}

        {(activeTab === 'year' || activeTab === 'recap') && (
          <YearInMemories
            memories={memories}
            places={places}
            onViewMemory={setSelectedMemory}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsSection
            onResetDemoData={handleResetDemoData}
            onRefreshData={loadVaultData}
            onOpenAdmin={() => handleNavigate('admin')}
          />
        )}
      </main>

      {/* Floating Audio Soundscape Player Widget */}
      <AudioPlayer />

      {/* Bottom Navigation for Mobile / Tablet screens */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onNavigate={handleNavigate}
        onOpenMore={() => handleNavigate('settings')}
      />

      {/* Full-Screen Cinematic Memory Viewer */}
      <MemoryViewer
        memory={selectedMemory}
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onEdit={(mem) => {
          setEditingMemory(mem);
          setMemoryModalOpen(true);
        }}
        onDelete={handleDeleteMemory}
        onToggleFavorite={handleToggleFavoriteMemory}
        onAddReaction={handleAddReaction}
        onNext={handleNextMemory}
        onPrev={handlePrevMemory}
      />

      {/* Add / Edit Memory Modal */}
      <MemoryModal
        isOpen={memoryModalOpen}
        onClose={() => {
          setMemoryModalOpen(false);
          setEditingMemory(null);
          setInitialDateForMemory(undefined);
        }}
        onSave={handleSaveMemory}
        initialMemory={
          editingMemory ||
          (initialDateForMemory
            ? ({
                id: '',
                userId: 'partner-1',
                creatorName: profile.name,
                title: '',
                date: initialDateForMemory,
                description: '',
                category: 'Everyday',
                mood: 'Peaceful',
                tags: [],
                photos: [],
                isFavorite: false,
                isPrivate: false,
                reactions: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Memory)
            : null)
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
