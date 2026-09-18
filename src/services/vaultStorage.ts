import { 
  Memory, 
  TimelineEvent, 
  PlaceMemory, 
  FutureLetter, 
  MemoryCapsule, 
  BucketListItem, 
  CountdownEvent, 
  UserProfile,
  SpecialDate,
  HomepageCms,
  CategoryItem,
  MoodItem,
  AuditLogEntry,
  AdminMediaItem
} from '../types';
import { 
  demoMemories, 
  demoTimeline, 
  demoPlaces, 
  demoLetters, 
  demoCapsules, 
  demoBucketList, 
  demoCountdowns, 
  initialProfile,
  demoSpecialDates,
  defaultHomepageCms,
  defaultCategories,
  defaultMoods,
  demoActivityLogs,
  demoMediaItems
} from '../data/demoData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { syncMemoryPhotosToDatabase } from './storageService';

const STORAGE_KEYS = {
  MEMORIES: 'dear_us_memories_v2',
  TIMELINE: 'dear_us_timeline_v2',
  PLACES: 'dear_us_places_v2',
  LETTERS: 'dear_us_letters_v2',
  CAPSULES: 'dear_us_capsules_v2',
  BUCKET_LIST: 'dear_us_bucket_list_v2',
  COUNTDOWNS: 'dear_us_countdowns_v2',
  PROFILE: 'dear_us_profile_v2',
  SPECIAL_DATES: 'dear_us_special_dates_v2',
  HOMEPAGE_CMS: 'dear_us_homepage_cms_v2',
  ACTIVITY_LOGS: 'dear_us_activity_logs_v2',
  CATEGORIES: 'dear_us_categories_v2',
  MOODS: 'dear_us_moods_v2',
  MEDIA_ITEMS: 'dear_us_media_items_v2',
};

// Helper for local storage with fallback
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

class VaultStorageService {
  // Profiles
  async getProfile(): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            name: data.name,
            partnerName: data.partner_name,
            relationshipStartDate: data.relationship_start_date,
            avatarUrl: data.avatar_url,
            partnerAvatarUrl: data.partner_avatar_url,
            anniversaryTitle: data.anniversary_title,
            customQuote: data.custom_quote,
          };
        }
      } catch (err) {
        console.warn('Supabase profile fetch error, falling back to local:', err);
      }
    }
    return loadFromStorage(STORAGE_KEYS.PROFILE, initialProfile);
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    saveToStorage(STORAGE_KEYS.PROFILE, profile);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          partner_name: profile.partnerName,
          relationship_start_date: profile.relationshipStartDate,
          avatar_url: profile.avatarUrl,
          partner_avatar_url: profile.partnerAvatarUrl,
          anniversary_title: profile.anniversaryTitle,
          custom_quote: profile.customQuote,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase profile save error:', err);
      }
    }
  }

  // Memories
    async getMemories(): Promise<Memory[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      // Fetch memories
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        // Fetch all photos stored in memory_photos
        const {
          data: photoData,
          error: photoError,
        } = await supabase
          .from('memory_photos')
          .select('memory_id, photo_url, sort_order')
          .order('sort_order', { ascending: true });

        if (photoError) {
          console.warn(
            'Supabase memory_photos fetch error:',
            photoError.message
          );
        }

        // Group photos by memory ID
        const photosByMemory = new Map<string, string[]>();

        if (!photoError && photoData) {
          photoData.forEach((photo: any) => {
            if (!photo.memory_id || !photo.photo_url) return;

            const existing =
              photosByMemory.get(photo.memory_id) || [];

            existing.push(photo.photo_url);

            photosByMemory.set(
              photo.memory_id,
              existing
            );
          });
        }

        const mapped: Memory[] = data.map((d: any) => {
          // Photos saved directly inside memories.photos
          const memoryPhotos = Array.isArray(d.photos)
            ? d.photos.filter(
                (url: any) =>
                  typeof url === 'string' &&
                  url.trim().length > 0
              )
            : [];

          // Photos saved inside memory_photos table
          const databasePhotos =
            photosByMemory.get(d.id) || [];

          /*
           * Prefer memories.photos because this is the
           * permanent public URL saved by the current
           * direct-upload system.
           *
           * Only fall back to memory_photos when
           * memories.photos is empty.
           */
          const photos =
            memoryPhotos.length > 0
              ? memoryPhotos
              : databasePhotos;

          return {
            id: d.id,
            userId: d.user_id,
            creatorName: d.creator_name,
            title: d.title,
            date: d.date,
            description: d.description,
            photos,

            location: d.location,
            latitude: d.latitude,
            longitude: d.longitude,

            mood: d.mood,
            category: d.category,
            tags: d.tags || [],

            isFavorite: d.is_favorite,
            isPrivate: d.is_private,

            voiceNoteUrl: d.voice_note_url,
            voiceNoteDuration: d.voice_note_duration,

            songTitle: d.song_title,
            songUrl: d.song_url,

            reactions: d.reactions || [],

            createdAt: d.created_at,
            updatedAt: d.updated_at,
          };
        });

        // Keep local cache synchronized
        saveToStorage(
          STORAGE_KEYS.MEMORIES,
          mapped
        );

        return mapped;
      }

      if (error) {
        console.warn(
          'Supabase memories query error:',
          error.message
        );
      }
    } catch (err) {
      console.warn(
        'Supabase memories fetch error, falling back to local:',
        err
      );
    }
  }

  // Fallback to local storage
  return loadFromStorage<Memory[]>(
    STORAGE_KEYS.MEMORIES,
    demoMemories
  );
    }

  async saveMemory(memory: Memory): Promise<Memory> {
  const memories = await this.getMemories();

  const existingIndex = memories.findIndex(
    (m) => m.id === memory.id
  );

  let updatedMemories: Memory[];

  if (existingIndex >= 0) {
    updatedMemories = [...memories];

    updatedMemories[existingIndex] = {
      ...memory,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updatedMemories = [
      memory,
      ...memories,
    ];
  }

  // Always keep local cache updated
  saveToStorage(
    STORAGE_KEYS.MEMORIES,
    updatedMemories
  );

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error: memoryError } =
        await supabase
          .from('memories')
          .upsert(
            {
              id: memory.id,
              user_id: memory.userId,
              creator_name: memory.creatorName,
              title: memory.title,
              date: memory.date,
              description: memory.description,
              photos: Array.isArray(memory.photos)
                ? memory.photos
                : [],
              location: memory.location,
              latitude: memory.latitude,
              longitude: memory.longitude,
              mood: memory.mood,
              category: memory.category,
              tags: memory.tags || [],
              is_favorite: memory.isFavorite,
              is_private: memory.isPrivate,
              voice_note_url: memory.voiceNoteUrl,
              voice_note_duration:
                memory.voiceNoteDuration,
              song_title: memory.songTitle,
              song_url: memory.songUrl,
              reactions: memory.reactions || [],
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict: 'id',
            }
          );

      if (memoryError) {
        console.error(
          '❌ Memory database save failed:',
          memoryError.message
        );

        throw new Error(
          `Memory database save failed: ${memoryError.message}`
        );
      }

      console.log(
        '✅ Memory saved to Supabase:',
        memory.id
      );

      // Sync photos only after memory itself
      // has successfully been saved.
      if (
        Array.isArray(memory.photos)
      ) {
        await syncMemoryPhotosToDatabase(
          memory.id,
          memory.photos
        );

        console.log(
          '✅ Memory photos synchronized:',
          memory.photos.length
        );
      }
    } catch (err) {
      console.error(
        '❌ Supabase memory save error:',
        err
      );

      // Local cache is still available,
      // but don't silently pretend Supabase saved it.
    }
  }

  return memory;
  }
  async deleteMemory(id: string): Promise<void> {
    const memories = await this.getMemories();
    const filtered = memories.filter((m) => m.id !== id);
    saveToStorage(STORAGE_KEYS.MEMORIES, filtered);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('memory_photos').delete().eq('memory_id', id);
        await supabase.from('memories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase memory delete error:', err);
      }
    }
  }

  async toggleFavorite(id: string): Promise<Memory | null> {
    const memories = await this.getMemories();
    const item = memories.find((m) => m.id === id);
    if (!item) return null;
    const updated = { ...item, isFavorite: !item.isFavorite, updatedAt: new Date().toISOString() };
    await this.saveMemory(updated);
    return updated;
  }

  // Timeline
  async getTimeline(): Promise<TimelineEvent[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('timeline_events').select('*').order('date', { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped: TimelineEvent[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            date: d.date,
            description: d.description,
            photos: d.photos || [],
            location: d.location,
            category: d.category,
            tags: d.tags || [],
            voiceNoteUrl: d.voice_note_url,
            songTitle: d.song_title,
            songUrl: d.song_url || d.voice_note_url,
            isMilestone: d.is_milestone,
            userId: d.user_id,
            createdAt: d.created_at,
          }));
          saveToStorage(STORAGE_KEYS.TIMELINE, mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase timeline error:', e);
      }
    }
    return loadFromStorage<TimelineEvent[]>(STORAGE_KEYS.TIMELINE, demoTimeline);
  }

  async saveTimelineEvent(event: TimelineEvent): Promise<TimelineEvent> {
  const events = await this.getTimeline();

  const idx = events.findIndex((e) => e.id === event.id);

  let updated: TimelineEvent[];

  if (idx >= 0) {
    updated = [...events];
    updated[idx] = event;
  } else {
    updated = [...events, event].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );
  }

  // Local cache
  saveToStorage(STORAGE_KEYS.TIMELINE, updated);

  const supabase = getSupabaseClient();

  if (!supabase) {
    console.warn(
      'Supabase client not available. Timeline saved locally only.'
    );
    return event;
  }

  try {
    // Get authenticated Supabase user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        'Could not get authenticated user:',
        authError
      );
      return event;
    }

    if (!user?.id) {
      console.error(
        'Timeline save failed: No authenticated user found.'
      );
      return event;
    }

    const timelineRow = {
      id: event.id,
      user_id: user.id,
      title: event.title,
      date: event.date,
      description: event.description || '',
      photo_url: event.photoUrl || null,
      photos: event.photos || [],
      location: event.location || null,
      category: event.category || 'Special',
      tags: event.tags || [],
      voice_note_url: event.voiceNoteUrl || null,
      is_milestone: event.isMilestone ?? false,
    };

    console.log(
      'Saving timeline event:',
      timelineRow
    );

    const { data, error } = await supabase
      .from('timeline_events')
      .upsert(timelineRow, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase timeline save error:',
        error.message,
        error.details,
        error.hint,
        error.code
      );

      return event;
    }

    console.log(
      'Timeline event successfully saved:',
      data
    );

    return event;
  } catch (error) {
    console.error(
      'Supabase timeline save exception:',
      error
    );

    return event;
  }
  }

  async deleteTimelineEvent(id: string): Promise<void> {
    const events = await this.getTimeline();
    const filtered = events.filter((e) => e.id !== id);
    saveToStorage(STORAGE_KEYS.TIMELINE, filtered);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('timeline_events').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase timeline delete error:', e);
      }
    }
  }

  // Places
  async getPlaces(): Promise<PlaceMemory[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('places').select('*').order('date', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: PlaceMemory[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            location: d.location,
            latitude: d.latitude,
            longitude: d.longitude,
            date: d.date,
            coverImage: d.cover_image,
            photos: d.photos || [],
            notes: d.notes || '',
            relatedMemoryIds: d.related_memory_ids || [],
            userId: d.user_id,
            isVisited: d.is_visited,
            createdAt: d.created_at,
          }));
          saveToStorage(STORAGE_KEYS.PLACES, mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase places error:', e);
      }
    }
    return loadFromStorage<PlaceMemory[]>(STORAGE_KEYS.PLACES, demoPlaces);
  }

  async savePlace(place: PlaceMemory): Promise<PlaceMemory> {
  const places = await this.getPlaces();

  const idx = places.findIndex((p) => p.id === place.id);

  let updated: PlaceMemory[];

  if (idx >= 0) {
    updated = [...places];
    updated[idx] = place;
  } else {
    updated = [place, ...places];
  }

  // Save locally
  saveToStorage(STORAGE_KEYS.PLACES, updated);

  // Save to Supabase
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.warn(
          'No authenticated user for place save:',
          userError
        );
      } else {
        const user = userData.user;

        const { data, error } = await supabase
          .from('places')
          .upsert({
            id: place.id,
            user_id: user.id,

            name: place.name,
            location: place.location,
            country: place.country || null,

            latitude: place.latitude ?? null,
            longitude: place.longitude ?? null,

            date: place.date || null,
            visit_date: place.visitDate || place.date || null,

            cover_image: place.coverImage || null,
            photos: place.photos || [],

            notes: place.notes || null,
            related_memory_ids: place.relatedMemoryIds || [],

            is_visited: place.isVisited ?? false,
          })
          .select()
          .single();

        if (error) {
          console.error(
            'Supabase place save error:',
            error
          );
        } else {
          console.log(
            'Place saved successfully:',
            data
          );
        }
      }
    } catch (error) {
      console.error(
        'Supabase place save exception:',
        error
      );
    }
  }

  return place;
  }
  async deletePlace(id: string): Promise<void> {
    const places = await this.getPlaces();
    const filtered = places.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PLACES, filtered);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('places').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase place delete error:', e);
      }
    }
  }

  // Letters
  async getLetters(): Promise<FutureLetter[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('future_letters')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) {
        console.error(
          'Supabase letters fetch error:',
          error
        );
      }

      if (!error && data && data.length > 0) {
        const mapped: FutureLetter[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          message: d.message,

          senderName: d.sender_name,
          senderId: d.sender_id,
          recipientName: d.recipient_name,

          createdDate: d.created_date,
          unlockDate: d.unlock_date,

          photoUrl: d.photo_url,

          voiceNoteUrl: d.voice_note_url || null,

          isOpened: d.is_opened ?? false,
          sealColor: d.seal_color,

          createdAt: d.created_at,
        }));

        saveToStorage(STORAGE_KEYS.LETTERS, mapped);

        return mapped;
      }
    } catch (error) {
      console.error(
        'Supabase letters error:',
        error
      );
    }
  }

  return loadFromStorage<FutureLetter[]>(
    STORAGE_KEYS.LETTERS,
    demoLetters
  );
  }

  async saveLetter(letter: FutureLetter): Promise<FutureLetter> {
  // 1. Get existing letters
  const letters = await this.getLetters();

  // 2. Update existing letter or add new letter
  const idx = letters.findIndex((l) => l.id === letter.id);

  let updated: FutureLetter[];

  if (idx >= 0) {
    updated = [...letters];
    updated[idx] = letter;
  } else {
    updated = [letter, ...letters];
  }

  // 3. Local cache
  saveToStorage(STORAGE_KEYS.LETTERS, updated);

  // 4. Supabase
  const supabase = getSupabaseClient();

  if (!supabase) {
    console.warn(
      'Supabase client not available. Letter saved locally only.'
    );
    return letter;
  }

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        'Could not get authenticated user:',
        authError
      );
      return letter;
    }

    if (!user?.id) {
      console.error(
        'Letter save failed: No authenticated user found.'
      );
      return letter;
    }

    const letterRow = {
      id: letter.id,
      sender_id: user.id,
      sender_name: letter.senderName || '',
      recipient_name: letter.recipientName || '',
      title: letter.title || '',
      message: letter.message || '',
      photo_url: letter.photoUrl || null,
      created_date: letter.createdDate || null,
      unlock_date: letter.unlockDate || null,
      is_opened: letter.isOpened ?? false,
      opened_at: letter.openedAt || null,
      seal_color: letter.sealColor || null,
    };

    console.log(
      'Saving Future Letter to Supabase:',
      letterRow
    );

    const { data, error } = await supabase
      .from('future_letters')
      .upsert(letterRow, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase Future Letter save error:',
        error.message,
        error.details,
        error.hint,
        error.code
      );

      return letter;
    }

    console.log(
      'Future Letter successfully saved:',
      data
    );

    return letter;
  } catch (error) {
    console.error(
      'Supabase Future Letter save exception:',
      error
    );

    return letter;
  }
  }

  async deleteLetter(id: string): Promise<void> {
    const letters = await this.getLetters();
    const filtered = letters.filter((l) => l.id !== id);
    saveToStorage(STORAGE_KEYS.LETTERS, filtered);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('letters').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase letter delete error:', e);
      }
    }
  }

  // Capsules
  async getCapsules(): Promise<MemoryCapsule[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('memory_capsules')
        .select('*')
        .order('unlock_date', { ascending: true });

      if (error) {
        console.error('Supabase capsules fetch error:', error);
      }

      if (!error && data && data.length > 0) {
        const mapped: MemoryCapsule[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          theme: d.theme,
          description: d.description,
          coverImage: d.cover_image,
          createdDate: d.created_date,
          unlockDate: d.unlock_date,
          creatorName: d.creator_name,
          creatorId: d.creator_id,

          photos: d.photos || [],
          message: d.message || '',
          notes: d.notes || [],
          links: d.links || {},

          voiceNoteUrl: d.voice_note_url || null,

          isUnlocked: d.is_unlocked ?? false,
          isSealed: d.is_sealed ?? false,

          mediaCount: d.media_count || 0,
          notesCount: d.notes_count || 0,

          createdAt: d.created_at,
        }));

        saveToStorage(STORAGE_KEYS.CAPSULES, mapped);

        return mapped;
      }
    } catch (e) {
      console.error('Supabase capsules error:', e);
    }
  }

  return loadFromStorage<MemoryCapsule[]>(
    STORAGE_KEYS.CAPSULES,
    demoCapsules
  );
  }

  async saveCapsule(capsule: MemoryCapsule): Promise<MemoryCapsule> {
  const capsules = await this.getCapsules();

  const idx = capsules.findIndex((c) => c.id === capsule.id);

  let updated: MemoryCapsule[];

  if (idx >= 0) {
    updated = [...capsules];
    updated[idx] = capsule;
  } else {
    updated = [capsule, ...capsules];
  }

  saveToStorage(STORAGE_KEYS.CAPSULES, updated);

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.warn(
          'No authenticated user for capsule save:',
          userError
        );
      } else {
        const user = userData.user;

        const { data, error } = await supabase
          .from('memory_capsules')
          .upsert({
            id: capsule.id,
            creator_id: user.id,
            creator_name: capsule.creatorName || user.id,
            title: capsule.title,
            theme: capsule.theme,
            description: capsule.description || null,
            cover_image: capsule.coverImage || null,
            message: capsule.message || null,
            photos: capsule.photos || [],
            notes: capsule.notes || [],
            links: capsule.links || {},
            voice_note_url: capsule.voiceNoteUrl || null,
            is_unlocked: capsule.isUnlocked ?? false,
            is_sealed: capsule.isSealed ?? false,
            created_date: capsule.createdDate,
            unlock_date: capsule.unlockDate,
            media_count: capsule.photos?.length || 0,
            notes_count: capsule.notes?.length || 0,
          })
          .select()
          .single();

        if (error) {
          console.error(
            'Supabase capsule save error:',
            error
          );
        } else {
          console.log(
            'Memory capsule saved successfully:',
            data
          );
        }
      }
    } catch (error) {
      console.error(
        'Supabase capsule save exception:',
        error
      );
    }
  }

  return capsule;
  }

  async deleteCapsule(id: string): Promise<void> {
    const capsules = await this.getCapsules();
    const filtered = capsules.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CAPSULES, filtered);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('capsules').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase capsule delete error:', e);
      }
    }
  }

  // Bucket list
  async getBucketList(): Promise<BucketListItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bucket_list').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: BucketListItem[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            targetDate: d.target_date,
            category: d.category,
            isCompleted: d.is_completed,
            completedDate: d.completed_date,
            completedPhoto: d.completed_photo,
            addedBy: d.added_by,
            createdAt: d.created_at,
          }));
          saveToStorage(STORAGE_KEYS.BUCKET_LIST, mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase bucket list error:', e);
      }
    }
    return loadFromStorage<BucketListItem[]>(STORAGE_KEYS.BUCKET_LIST, demoBucketList);
  }

  async saveBucketItem(item: BucketListItem): Promise<BucketListItem> {
    const items = await this.getBucketList();
    const idx = items.findIndex((i) => i.id === item.id);
    let updated: BucketListItem[];
    if (idx >= 0) {
      updated = [...items];
      updated[idx] = item;
    } else {
      updated = [item, ...items];
    }
    saveToStorage(STORAGE_KEYS.BUCKET_LIST, updated);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('bucket_list').upsert({
          id: item.id,
          user_id: 'partner-1',
          added_by: item.addedBy,
          title: item.title,
          description: item.description,
          target_date: item.targetDate,
          category: item.category,
          is_completed: item.isCompleted,
          completed_date: item.completedDate,
          completed_photo: item.completedPhoto,
        });
      } catch (e) {
        console.warn('Supabase bucket save error:', e);
      }
    }
    return item;
  }

  async deleteBucketItem(id: string): Promise<void> {
    const items = await this.getBucketList();
    const filtered = items.filter((i) => i.id !== id);
    saveToStorage(STORAGE_KEYS.BUCKET_LIST, filtered);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('bucket_list').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase bucket delete error:', e);
      }
    }
  }

  // Countdowns
  async getCountdowns(): Promise<CountdownEvent[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('countdowns').select('*').order('target_date', { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped: CountdownEvent[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            targetDate: d.target_date,
            category: d.category,
            isRecurringYearly: d.is_recurring_yearly,
            notes: d.notes,
            coverImage: d.cover_image,
            createdAt: d.created_at,
          }));
          saveToStorage(STORAGE_KEYS.COUNTDOWNS, mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase countdowns error:', e);
      }
    }
    return loadFromStorage<CountdownEvent[]>(STORAGE_KEYS.COUNTDOWNS, demoCountdowns);
  }

  async saveCountdown(countdown: CountdownEvent): Promise<CountdownEvent> {
    const list = await this.getCountdowns();
    const idx = list.findIndex((c) => c.id === countdown.id);
    let updated: CountdownEvent[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = countdown;
    } else {
      updated = [...list, countdown].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
    }
    saveToStorage(STORAGE_KEYS.COUNTDOWNS, updated);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('countdowns').upsert({
          id: countdown.id,
          user_id: 'partner-1',
          title: countdown.title,
          target_date: countdown.targetDate,
          category: countdown.category,
          is_recurring_yearly: countdown.isRecurringYearly,
          notes: countdown.notes,
          cover_image: countdown.coverImage,
        });
      } catch (e) {
        console.warn('Supabase countdown save error:', e);
      }
    }
    return countdown;
  }

  async deleteCountdown(id: string): Promise<void> {
    const list = await this.getCountdowns();
    const filtered = list.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.COUNTDOWNS, filtered);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('countdowns').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase countdown delete error:', e);
      }
    }
  }

  // Upload helper: Handles file to Supabase storage OR optimized Base64
  async uploadFile(file: File, bucket: 'memories' | 'avatars' | 'audio' = 'memories'): Promise<string> {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds the 10MB limit.');
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${bucket}/${fileName}`;

        const { error: uploadError } = await supabase.storage
  .from(bucket)
  .upload(filePath, file);

if (!uploadError) {
  if (bucket === 'memories') {
    const { data: signedData, error: signedError } =
      await supabase.storage
        .from('memories')
        .createSignedUrl(filePath, 3600);

    if (!signedError && signedData?.signedUrl) {
      return signedData.signedUrl;
    }

    console.warn('Failed to create signed URL:', signedError);
  } else {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (data?.publicUrl) {
      return data.publicUrl;
    }
  }
}
      } catch (err) {
        console.warn('Supabase storage upload failed, falling back to local data URL:', err);
      }
    }

    // Fallback: Convert to Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as Data URL'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  }

  // Special Dates
  async getSpecialDates(): Promise<SpecialDate[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('special_dates')
          .select('*')
          .order('date', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            date: d.date,
            category: d.category,
            description: d.description,
            isReminderEnabled: d.is_reminder_enabled ?? true,
            isVisibleOnHome: d.is_visible_on_home ?? true,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase special_dates fetch error, using local fallback:', err);
      }
    }
    return loadFromStorage(STORAGE_KEYS.SPECIAL_DATES, demoSpecialDates);
  }

  async saveSpecialDate(sd: SpecialDate): Promise<void> {
    const list = await this.getSpecialDates();
    const index = list.findIndex((x) => x.id === sd.id);
    let updated: SpecialDate[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = sd;
    } else {
      updated = [sd, ...list];
    }
    saveToStorage(STORAGE_KEYS.SPECIAL_DATES, updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('special_dates').upsert({
          id: sd.id,
          title: sd.title,
          date: sd.date,
          category: sd.category,
          description: sd.description,
          is_reminder_enabled: sd.isReminderEnabled,
          is_visible_on_home: sd.isVisibleOnHome,
          created_at: sd.createdAt,
        });
      } catch (err) {
        console.warn('Supabase save special_dates error:', err);
      }
    }
  }

  async deleteSpecialDate(id: string): Promise<void> {
    const list = await this.getSpecialDates();
    const updated = list.filter((x) => x.id !== id);
    saveToStorage(STORAGE_KEYS.SPECIAL_DATES, updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('special_dates').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete special_dates error:', err);
      }
    }
  }

  // Homepage CMS & Site Settings
  async getHomepageCms(): Promise<HomepageCms> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Try site_settings first, then homepage_cms
        let { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .single();

        if (error || !data) {
          const cmsRes = await supabase
            .from('homepage_cms')
            .select('*')
            .limit(1)
            .single();
          data = cmsRes.data;
          error = cmsRes.error;
        }

        if (!error && data) {
          return {
            heroHeading: data.hero_heading || defaultHomepageCms.heroHeading,
            tagline: data.tagline || defaultHomepageCms.tagline,
            introText: data.intro_text || defaultHomepageCms.introText,
            featuredMemoryId: data.featured_memory_id,
            featuredStoryId: data.featured_story_id,
            showStats: data.show_stats ?? true,
            showOnThisDay: data.show_on_this_day ?? true,
            showUpcomingCountdown: data.show_upcoming_countdown ?? true,
            enterStoryCta: data.enter_story_cta || 'Enter Our Story',
            addMemoryCta: data.add_memory_cta || 'Add a Memory',
            rediscoverCta: data.rediscover_cta || 'Rediscover',
            updatedAt: data.updated_at || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Supabase site_settings / homepage_cms fetch error, using local fallback:', err);
      }
    }
    return loadFromStorage(STORAGE_KEYS.HOMEPAGE_CMS, defaultHomepageCms);
  }

  async saveHomepageCms(cms: HomepageCms): Promise<void> {
    saveToStorage(STORAGE_KEYS.HOMEPAGE_CMS, cms);
    const supabase = getSupabaseClient();
    if (supabase) {
      const payload = {
        hero_heading: cms.heroHeading,
        tagline: cms.tagline,
        intro_text: cms.introText,
        featured_memory_id: cms.featuredMemoryId,
        featured_story_id: cms.featuredStoryId,
        show_stats: cms.showStats,
        show_on_this_day: cms.showOnThisDay,
        show_upcoming_countdown: cms.showUpcomingCountdown,
        enter_story_cta: cms.enterStoryCta,
        add_memory_cta: cms.addMemoryCta,
        rediscover_cta: cms.rediscoverCta,
        updated_at: new Date().toISOString(),
      };

      try {
        await supabase.from('site_settings').upsert({ id: 'default_settings', ...payload });
      } catch (err) {
        // quiet ignore
      }

      try {
        await supabase.from('homepage_cms').upsert({ id: 'default_cms', ...payload });
      } catch (err) {
        // quiet ignore
      }
    }
  }

  // Categories & Moods
  async getCategories(): Promise<CategoryItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            color: c.color || '#DFBF99',
            description: c.description,
          }));
        }
      } catch (err) {
        console.warn('Supabase categories fetch error, using local fallback:', err);
      }
    }
    return loadFromStorage(STORAGE_KEYS.CATEGORIES, defaultCategories);
  }

  async saveCategories(cats: CategoryItem[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.CATEGORIES, cats);
  }

  async saveCategory(cat: CategoryItem): Promise<void> {
    const list = await this.getCategories();
    const idx = list.findIndex((c) => c.id === cat.id);
    let updated: CategoryItem[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = cat;
    } else {
      updated = [...list, cat];
    }
    await this.saveCategories(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('categories').upsert({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          description: cat.description,
        });
      } catch (err) {
        console.warn('Supabase save category error:', err);
      }
    }
  }

  async deleteCategory(id: string, reassignToId?: string): Promise<void> {
    const list = await this.getCategories();
    const target = list.find((c) => c.id === id);
    const replacement = reassignToId ? list.find((c) => c.id === reassignToId) : undefined;
    const updated = list.filter((c) => c.id !== id);
    await this.saveCategories(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete category error:', err);
      }
    }

    if (target && replacement) {
      const mems = await this.getMemories();
      const updatedMems = mems.map((m) =>
        (m.category && target?.name && m.category.toLowerCase() === target.name.toLowerCase())
          ? { ...m, category: replacement.name as any }
          : m
      );
      saveToStorage(STORAGE_KEYS.MEMORIES, updatedMems);
    }
  }

  async getMoods(): Promise<MoodItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('moods')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((m: any) => ({
            id: m.id,
            name: m.name,
            emoji: m.emoji,
            color: m.color || '#C25D7C',
            description: m.description,
          }));
        }
      } catch (err) {
        console.warn('Supabase moods fetch error, using local fallback:', err);
      }
    }
    return loadFromStorage(STORAGE_KEYS.MOODS, defaultMoods);
  }

  async saveMoods(moods: MoodItem[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.MOODS, moods);
  }

  async saveMood(mood: MoodItem): Promise<void> {
    const list = await this.getMoods();
    const idx = list.findIndex((m) => m.id === mood.id);
    let updated: MoodItem[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = mood;
    } else {
      updated = [...list, mood];
    }
    await this.saveMoods(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('moods').upsert({
          id: mood.id,
          name: mood.name,
          emoji: mood.emoji,
          color: mood.color,
          description: mood.description,
        });
      } catch (err) {
        console.warn('Supabase save mood error:', err);
      }
    }
  }

  async deleteMood(id: string, reassignToId?: string): Promise<void> {
    const list = await this.getMoods();
    const target = list.find((m) => m.id === id);
    const replacement = reassignToId ? list.find((m) => m.id === reassignToId) : undefined;
    const updated = list.filter((m) => m.id !== id);
    await this.saveMoods(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('moods').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete mood error:', err);
      }
    }

    if (target && replacement) {
      const mems = await this.getMemories();
      const updatedMems = mems.map((m) =>
        (m.mood && target?.name && m.mood.toLowerCase() === target.name.toLowerCase())
          ? { ...m, mood: replacement.name as any }
          : m
      );
      saveToStorage(STORAGE_KEYS.MEMORIES, updatedMems);
    }
  }

  async checkCategoryUsage(categoryName: string): Promise<{ memoryCount: number; placeCount: number; timelineCount: number }> {
    const mems = await this.getMemories();
    const tls = await this.getTimeline();
    const cds = await this.getCountdowns();

    const targetCat = (categoryName || '').toLowerCase();
    const memCount = mems.filter((m) => m.category && m.category.toLowerCase() === targetCat).length;
    const tlCount = tls.filter((t) => t.category && t.category.toLowerCase() === targetCat).length;
    const cdCount = cds.filter((c) => c.category && c.category.toLowerCase() === targetCat).length;

    return {
      memoryCount: memCount,
      placeCount: cdCount,
      timelineCount: tlCount,
    };
  }

  async checkMoodUsage(moodName: string): Promise<{ memoryCount: number }> {
    const mems = await this.getMemories();
    const targetMood = (moodName || '').toLowerCase();
    const count = mems.filter((m) => m.mood && m.mood.toLowerCase() === targetMood).length;
    return { memoryCount: count };
  }

  // Activity / Audit Logs
  async getActivityLogs(): Promise<AuditLogEntry[]> {
    return loadFromStorage(STORAGE_KEYS.ACTIVITY_LOGS, demoActivityLogs);
  }

  async addActivityLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const list = await this.getActivityLogs();
    const newEntry: AuditLogEntry = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...list.slice(0, 99)]; // retain last 100 entries
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('activity_logs').insert({
          id: newEntry.id,
          action: newEntry.action,
          entity: newEntry.entity,
          entity_id: newEntry.entityId,
          entity_title: newEntry.entityTitle,
          admin_user: newEntry.adminUser,
          summary: newEntry.summary,
          timestamp: newEntry.timestamp,
        });
      } catch (err) {
        // quiet ignore in local mode
      }
    }
  }

  async clearActivityLogs(): Promise<void> {
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, []);
  }

  // Media Library
  async getMediaLibrary(): Promise<AdminMediaItem[]> {
    const stored = loadFromStorage<AdminMediaItem[]>(STORAGE_KEYS.MEDIA_ITEMS, demoMediaItems);
    // Also discover any photos referenced in memories, places, etc. that aren't yet in media items
    const mems = await this.getMemories();
    const places = await this.getPlaces();
    const existingUrls = new Set(stored.map((m) => m.url));

    const discovered: AdminMediaItem[] = [];
    mems.forEach((m) => {
      m.photos?.forEach((url, i) => {
        if (url && !existingUrls.has(url)) {
          existingUrls.add(url);
          const safeTitle = (m.title || 'memory').slice(0, 20).replace(/\s+/g, '-').toLowerCase();
          discovered.push({
            id: `med-disc-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
            name: `${safeTitle}-${i + 1}.jpg`,
            url,
            sizeBytes: 450000,
            mimeType: 'image/jpeg',
            uploadedAt: m.createdAt || new Date().toISOString(),
            usedIn: [m.title || 'Memory'],
          });
        }
      });
    });

    places.forEach((p) => {
      if (p.coverImage && !existingUrls.has(p.coverImage)) {
        existingUrls.add(p.coverImage);
        const safePlace = (p.name || 'place').slice(0, 20).replace(/\s+/g, '-').toLowerCase();
        discovered.push({
          id: `med-place-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          name: `${safePlace}-cover.jpg`,
          url: p.coverImage,
          sizeBytes: 520000,
          mimeType: 'image/jpeg',
          uploadedAt: p.createdAt || new Date().toISOString(),
          usedIn: [p.name || 'Place'],
        });
      }
    });

    if (discovered.length > 0) {
      const merged = [...stored, ...discovered];
      saveToStorage(STORAGE_KEYS.MEDIA_ITEMS, merged);
      return merged;
    }

    return stored;
  }

  async saveMediaItem(item: AdminMediaItem): Promise<void> {
    const list = await this.getMediaLibrary();
    const idx = list.findIndex((m) => m.id === item.id || m.url === item.url);
    let updated: AdminMediaItem[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = item;
    } else {
      updated = [item, ...list];
    }
    saveToStorage(STORAGE_KEYS.MEDIA_ITEMS, updated);
  }

  async deleteMediaItem(id: string): Promise<void> {
    const list = await this.getMediaLibrary();
    const updated = list.filter((m) => m.id !== id);
    saveToStorage(STORAGE_KEYS.MEDIA_ITEMS, updated);
  }

  async replaceMediaUrl(oldUrl: string, newUrl: string): Promise<{ affectedCount: number }> {
    let affected = 0;
    // Replace in memories
    const mems = await this.getMemories();
    let memsChanged = false;
    const updatedMems = mems.map((m) => {
      let changed = false;
      const newPhotos = (m.photos || []).map((p) => {
        if (p === oldUrl) {
          changed = true;
          affected++;
          return newUrl;
        }
        return p;
      });
      if (changed) {
        memsChanged = true;
        return { ...m, photos: newPhotos };
      }
      return m;
    });
    if (memsChanged) {
      saveToStorage(STORAGE_KEYS.MEMORIES, updatedMems);
    }

    // Replace in places
    const places = await this.getPlaces();
    let placesChanged = false;
    const updatedPlaces = places.map((pl) => {
      let changed = false;
      let cover = pl.coverImage;
      if (cover === oldUrl) {
        cover = newUrl;
        changed = true;
        affected++;
      }
      const newPhotos = (pl.photos || []).map((p) => {
        if (p === oldUrl) {
          changed = true;
          affected++;
          return newUrl;
        }
        return p;
      });
      if (changed) {
        placesChanged = true;
        return { ...pl, coverImage: cover, photos: newPhotos };
      }
      return pl;
    });
    if (placesChanged) {
      saveToStorage(STORAGE_KEYS.PLACES, updatedPlaces);
    }

    // Update media items list
    const media = await this.getMediaLibrary();
    const updatedMedia = media.map((item) => {
      if (item.url === oldUrl) {
        return { ...item, url: newUrl };
      }
      return item;
    });
    saveToStorage(STORAGE_KEYS.MEDIA_ITEMS, updatedMedia);

    return { affectedCount: affected };
  }

  // Export and Reset
  async exportVaultJson(): Promise<string> {
    const profile = await this.getProfile();
    const memories = await this.getMemories();
    const timeline = await this.getTimeline();
    const places = await this.getPlaces();
    const letters = await this.getLetters();
    const capsules = await this.getCapsules();
    const bucketList = await this.getBucketList();
    const countdowns = await this.getCountdowns();
    const specialDates = await this.getSpecialDates();
    const homepageCms = await this.getHomepageCms();
    const categories = await this.getCategories();
    const moods = await this.getMoods();
    const activityLogs = await this.getActivityLogs();
    const mediaItems = await this.getMediaLibrary();

    const vaultExport = {
      app: 'Dear Us',
      exportedAt: new Date().toISOString(),
      profile,
      memories,
      timeline,
      places,
      letters,
      capsules,
      bucketList,
      countdowns,
      specialDates,
      homepageCms,
      categories,
      moods,
      activityLogs,
      mediaItems,
    };

    return JSON.stringify(vaultExport, null, 2);
  }

  async exportVaultData(): Promise<string> {
    return this.exportVaultJson();
  }

  async importVaultData(jsonString: string): Promise<boolean> {
    return this.restoreVaultJson(jsonString);
  }

  async restoreVaultJson(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) saveToStorage(STORAGE_KEYS.PROFILE, data.profile);
      if (Array.isArray(data.memories)) saveToStorage(STORAGE_KEYS.MEMORIES, data.memories);
      if (Array.isArray(data.timeline)) saveToStorage(STORAGE_KEYS.TIMELINE, data.timeline);
      if (Array.isArray(data.places)) saveToStorage(STORAGE_KEYS.PLACES, data.places);
      if (Array.isArray(data.letters)) saveToStorage(STORAGE_KEYS.LETTERS, data.letters);
      if (Array.isArray(data.capsules)) saveToStorage(STORAGE_KEYS.CAPSULES, data.capsules);
      if (Array.isArray(data.bucketList)) saveToStorage(STORAGE_KEYS.BUCKET_LIST, data.bucketList);
      if (Array.isArray(data.countdowns)) saveToStorage(STORAGE_KEYS.COUNTDOWNS, data.countdowns);
      if (Array.isArray(data.specialDates)) saveToStorage(STORAGE_KEYS.SPECIAL_DATES, data.specialDates);
      if (data.homepageCms) saveToStorage(STORAGE_KEYS.HOMEPAGE_CMS, data.homepageCms);
      if (Array.isArray(data.categories)) saveToStorage(STORAGE_KEYS.CATEGORIES, data.categories);
      if (Array.isArray(data.moods)) saveToStorage(STORAGE_KEYS.MOODS, data.moods);
      if (Array.isArray(data.activityLogs)) saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, data.activityLogs);
      if (Array.isArray(data.mediaItems)) saveToStorage(STORAGE_KEYS.MEDIA_ITEMS, data.mediaItems);
      return true;
    } catch (err) {
      console.error('Failed to restore vault JSON:', err);
      return false;
    }
  }

  resetToDemo(): void {
    saveToStorage(STORAGE_KEYS.PROFILE, initialProfile);
    saveToStorage(STORAGE_KEYS.MEMORIES, demoMemories);
    saveToStorage(STORAGE_KEYS.TIMELINE, demoTimeline);
    saveToStorage(STORAGE_KEYS.PLACES, demoPlaces);
    saveToStorage(STORAGE_KEYS.LETTERS, demoLetters);
    saveToStorage(STORAGE_KEYS.CAPSULES, demoCapsules);
    saveToStorage(STORAGE_KEYS.BUCKET_LIST, demoBucketList);
    saveToStorage(STORAGE_KEYS.COUNTDOWNS, demoCountdowns);
    saveToStorage(STORAGE_KEYS.SPECIAL_DATES, demoSpecialDates);
    saveToStorage(STORAGE_KEYS.HOMEPAGE_CMS, defaultHomepageCms);
    saveToStorage(STORAGE_KEYS.CATEGORIES, defaultCategories);
    saveToStorage(STORAGE_KEYS.MOODS, defaultMoods);
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, demoActivityLogs);
    saveToStorage(STORAGE_KEYS.MEDIA_ITEMS, demoMediaItems);
  }
}

export const vaultStorage = new VaultStorageService();
