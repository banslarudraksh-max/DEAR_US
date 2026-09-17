import { getSupabaseClient } from './supabase';

export interface UploadAudioItem {
  id: string;
  file?: File;
  previewUrl: string;
  url?: string;
  storagePath?: string;
  title?: string;
  duration?: number;
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  isExisting?: boolean;
}

const MAX_AUDIO_SIZE_MB = 35; // 35 MB to easily accommodate full length songs
const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm', 'flac', 'opus'];

/**
 * Ensures MP3 files strictly receive the standard 'audio/mpeg' MIME type.
 */
export const getMimeTypeForAudio = (file: File | { name?: string; type?: string }): string => {
  const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
  if (ext === 'mp3') return 'audio/mpeg';
  if (ext === 'wav') return 'audio/wav';
  if (ext === 'm4a') return 'audio/mp4';
  if (ext === 'aac') return 'audio/aac';
  if (ext === 'ogg') return 'audio/ogg';
  if (ext === 'webm') return 'audio/webm';
  if (ext === 'flac') return 'audio/flac';
  if (ext === 'opus') return 'audio/opus';
  if (file.type && file.type.startsWith('audio/')) return file.type;
  return 'audio/mpeg';
};

export const validateAudioFile = (
  file: File,
  maxSizeMb = MAX_AUDIO_SIZE_MB
): { valid: boolean; error?: string } => {
  if (!file) return { valid: false, error: 'No audio file provided' };

  const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
  const isAudioType = file.type ? file.type.startsWith('audio/') || file.type === 'video/webm' || file.type === 'video/ogg' : false;
  const isExtensionValid = ALLOWED_AUDIO_EXTENSIONS.includes(ext);

  if (!isAudioType && !isExtensionValid) {
    return {
      valid: false,
      error: `Unsupported audio format "${file.name}". Please choose an MP3, WAV, M4A, OGG, or WebM audio file.`,
    };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeMb}MB. Maximum allowed audio size is ${maxSizeMb}MB.`,
    };
  }

  return { valid: true };
};

/**
 * Calculates audio duration in seconds using browser Audio element
 */
export const getAudioDuration = (fileOrUrl: File | string): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';

      const cleanup = (urlToRevoke?: string) => {
        if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(urlToRevoke);
          } catch {
            // ignore
          }
        }
      };

      let srcUrl = '';
      if (typeof fileOrUrl === 'string') {
        srcUrl = fileOrUrl;
      } else {
        srcUrl = URL.createObjectURL(fileOrUrl);
      }

      audio.onloadedmetadata = () => {
        const dur = Math.round(audio.duration || 0);
        if (typeof fileOrUrl !== 'string') cleanup(srcUrl);
        resolve(dur);
      };

      audio.onerror = () => {
        if (typeof fileOrUrl !== 'string') cleanup(srcUrl);
        resolve(0);
      };

      audio.src = srcUrl;
    } catch {
      resolve(0);
    }
  });
};

// In-memory cache mapping storage paths to Blob/Object URLs for instant local playback & fallback
const localAudioBlobCache = new Map<string, { blob: Blob; objectUrl: string; duration: number }>();

// Cache mapping storage paths to generated signed URLs with expiration timestamps
const signedUrlCache = new Map<string, { signedUrl: string; expiresAt: number }>();

/**
 * Caches a local audio blob for a storage path so playback can immediately succeed
 */
export function cacheLocalAudioBlob(storagePath: string, blob: Blob, duration = 0): string {
  const cleanPath = extractCleanStoragePath(storagePath);
  const existing = localAudioBlobCache.get(cleanPath);
  if (existing?.objectUrl) {
    return existing.objectUrl;
  }
  const objectUrl = URL.createObjectURL(blob);
  localAudioBlobCache.set(cleanPath, { blob, objectUrl, duration });
  return objectUrl;
}

/**
 * Determines whether a string is a Supabase Storage path or Supabase storage URL
 */
export function isStoragePath(val?: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return false;
  if (trimmed.includes('spotify.com') || trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) return false;
  if (trimmed.includes('apple.com') || trimmed.includes('soundcloud.com')) return false;

  // Supabase URL pointing to audio bucket
  if (trimmed.includes('/storage/v1/object/') && (trimmed.includes('/audio/') || trimmed.includes('bucket=audio'))) {
    return true;
  }

  // Relative storage path, e.g. "partner-user/tracks/172384.mp3" or "tracks/172384.mp3"
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return (
      trimmed.includes('/') ||
      trimmed.endsWith('.mp3') ||
      trimmed.endsWith('.wav') ||
      trimmed.endsWith('.m4a') ||
      trimmed.endsWith('.ogg') ||
      trimmed.endsWith('.webm') ||
      trimmed.endsWith('.aac')
    );
  }

  return false;
}

/**
 * Extracts clean relative storage path inside the 'audio' bucket
 */
export function extractCleanStoragePath(val: string): string {
  let path = val.trim();

  // If full Supabase URL: https://.../storage/v1/object/(public|sign|authenticated)/audio/<path>
  const urlMatch = path.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/audio\/([^?#]+)/);
  if (urlMatch && urlMatch[1]) {
    path = decodeURIComponent(urlMatch[1]);
  } else {
    // If URL with query string, strip query string
    if (path.includes('?')) {
      path = path.split('?')[0];
    }
  }

  // Strip leading 'audio/' prefix if present
  if (path.startsWith('audio/')) {
    path = path.substring(6);
  }

  // Strip leading slashes
  return path.replace(/^\/+/, '');
}

/**
 * Generates a valid signed URL from a Supabase Storage path in the private 'audio' bucket
 */
export async function createSignedAudioUrl(storagePath: string, expiresIn = 7200): Promise<string> {
  const cleanPath = extractCleanStoragePath(storagePath);
  if (!cleanPath) {
    throw new Error('Invalid storage path for audio');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not available');
  }

  // Ensure authenticated session is active
  try {
    await supabase.auth.getSession();
  } catch {
    // continue
  }

  const { data, error } = await supabase.storage
    .from('audio')
    .createSignedUrl(cleanPath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || `Failed to create signed playback URL for ${cleanPath}`);
  }

  // Cache signed URL (expires in expiresIn - 60 seconds)
  signedUrlCache.set(cleanPath, {
    signedUrl: data.signedUrl,
    expiresAt: Date.now() + (expiresIn - 60) * 1000,
  });

  return data.signedUrl;
}

/**
 * Resolves any audio reference (Storage PATH, Supabase URL, local blob) into a valid playable URL.
 * For private Supabase Storage paths, generates an authenticated signed URL.
 */
export async function resolveAudioPlaybackUrl(pathOrUrl?: string, forceRefresh = false): Promise<string> {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return '';
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return '';

  // Direct local playable formats
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Streaming services (handled via embedded iframes)
  if (trimmed.includes('spotify.com') || trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return trimmed;
  }

  // If this is a Supabase Storage path or Supabase audio URL
  if (isStoragePath(trimmed)) {
    const cleanPath = extractCleanStoragePath(trimmed);

    // 1. Check signed URL cache
    if (!forceRefresh) {
      const cached = signedUrlCache.get(cleanPath);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.signedUrl;
      }
    }

    // 2. Request fresh signed URL from Supabase Storage
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const signedUrl = await createSignedAudioUrl(cleanPath, 7200);
        if (signedUrl) {
          return signedUrl;
        }
      } catch (err: any) {
        console.warn('Could not generate Supabase signed audio URL:', err?.message || err);
      }
    }

    // 3. Fallback to local session object cache (e.g. just uploaded in this session)
    const localCached = localAudioBlobCache.get(cleanPath) || localAudioBlobCache.get(trimmed);
    if (localCached?.objectUrl) {
      return localCached.objectUrl;
    }

    // 4. If it was already an http/https URL (e.g. an existing valid URL), return it
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    throw new Error(`Audio file "${cleanPath}" could not be loaded from private storage.`);
  }

  return trimmed;
}

/**
 * Upload an audio file to Supabase Storage bucket 'audio'.
 * 1. User selects an MP3/audio file.
 * 2. Uploads to Supabase 'audio' Storage bucket with correct MIME type ('audio/mpeg' for mp3).
 * 3. Returns the Storage PATH to be stored in the database.
 * 4. Pre-generates signed playback URL for immediate sound playback.
 * 5. Does NOT use getPublicUrl() on the private audio bucket.
 */
export async function uploadAudioFileToStorage(
  file: File,
  folderId = 'tracks',
  userId?: string,
  onProgress?: (percent: number) => void
): Promise<{ path: string; duration: number; signedUrl: string; mimeType: string }> {
  onProgress?.(10);

  // Validate file
  const validation = validateAudioFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid audio file');
  }

  // Extract duration
  const duration = await getAudioDuration(file);
  onProgress?.(25);

  // Determine correct MIME type (strictly 'audio/mpeg' for MP3)
  const mimeType = getMimeTypeForAudio(file);

  const supabase = getSupabaseClient();

  let authUserId = userId;
  if (supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        authUserId = sessionData.session.user.id;
      }
    } catch {
      // ignore
    }
  }

  if (!authUserId) {
    authUserId = 'partner-user';
  }

  const originalExt = (file.name || 'audio.mp3').split('.').pop()?.toLowerCase() || 'mp3';
  const cleanExt = originalExt.replace(/[^a-z0-9]/gi, '') || 'mp3';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const uniqueFilename = `${timestamp}-${randomSuffix}.${cleanExt}`;
  
  // Storage PATH to be stored in the database (e.g. "userId/tracks/172382-abcd.mp3")
  const storagePath = `${authUserId}/${folderId}/${uniqueFilename}`;

  // Cache local object URL for instant, zero-latency playback preview and resilient fallback
  const localPreviewUrl = cacheLocalAudioBlob(storagePath, file, duration);

  let signedPlaybackUrl = '';

  if (supabase) {
    try {
      onProgress?.(45);

      // Upload to private Supabase 'audio' bucket with correct MIME type ('audio/mpeg')
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(storagePath, file, {
          cacheControl: '3600',
          contentType: mimeType, // strictly 'audio/mpeg' for MP3
          upsert: true,
        });

      onProgress?.(80);

      if (!uploadError) {
        // Generate valid signed playback URL from the storage path (valid for 2 hours)
        try {
          const { data: signData, error: signError } = await supabase.storage
            .from('audio')
            .createSignedUrl(storagePath, 7200);

          if (!signError && signData?.signedUrl) {
            signedPlaybackUrl = signData.signedUrl;
            signedUrlCache.set(storagePath, {
              signedUrl: signData.signedUrl,
              expiresAt: Date.now() + 7100 * 1000,
            });
          } else if (signError) {
            console.warn('createSignedUrl returned error:', signError.message);
          }
        } catch (signErr) {
          console.warn('Error during createSignedUrl:', signErr);
        }
      } else {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (err: any) {
      console.warn('Supabase storage exception:', err?.message || err);
    }
  }

  onProgress?.(100);

  // Return the Storage PATH for database persistence and signedUrl for immediate playback
  return {
    path: storagePath,
    duration,
    signedUrl: signedPlaybackUrl || localPreviewUrl,
    mimeType,
  };
}

export type ExternalMusicProvider = 
  | 'spotify'
  | 'youtube'
  | 'apple_music'
  | 'soundcloud'
  | 'direct_audio'
  | 'unknown'
  | 'none';

/**
 * Detect external music provider from URL
 */
export function detectAudioProvider(url?: string): ExternalMusicProvider {
  if (!url || typeof url !== 'string') return 'none';
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return 'none';

  if (trimmed.includes('spotify.com')) return 'spotify';
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) return 'youtube';
  if (trimmed.includes('music.apple.com') || trimmed.includes('itunes.apple.com')) return 'apple_music';
  if (trimmed.includes('soundcloud.com')) return 'soundcloud';

  // Direct audio stream / file
  if (
    trimmed.endsWith('.mp3') ||
    trimmed.endsWith('.wav') ||
    trimmed.endsWith('.m4a') ||
    trimmed.endsWith('.ogg') ||
    trimmed.endsWith('.webm') ||
    trimmed.startsWith('data:audio/') ||
    trimmed.startsWith('blob:')
  ) {
    return 'direct_audio';
  }

  // If starts with http and might be an audio stream
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return 'unknown';
  }

  return 'none';
}

/**
 * Converts standard Spotify link into Spotify embed iframe URL
 * e.g. https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT -> https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT
 */
export function getSpotifyEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('spotify.com')) return null;

    // Matches /track/xxx, /album/xxx, /playlist/xxx, /episode/xxx
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'embed') {
      return url; // Already an embed URL
    }

    const type = pathParts[0]; // track, album, playlist, episode
    const id = pathParts[1];

    if (type && id) {
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Converts standard YouTube link into YouTube embed URL
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`;
    }

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`;
      
      // Handles /embed/ or /shorts/
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'embed' && pathParts[1]) return url;
      if (pathParts[0] === 'shorts' && pathParts[1]) {
        return `https://www.youtube-nocookie.com/embed/${pathParts[1]}?autoplay=0&rel=0`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Formats seconds into MM:SS
 */
export function formatAudioDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
