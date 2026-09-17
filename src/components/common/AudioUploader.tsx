import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Music, 
  Play, 
  Pause, 
  ExternalLink, 
  Radio, 
  Disc, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileAudio,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  validateAudioFile, 
  uploadAudioFileToStorage, 
  getAudioDuration, 
  detectAudioProvider,
  formatAudioDuration,
  ExternalMusicProvider
} from '../../services/audioStorageService';
import { UnifiedAudioPlayer } from './AudioPlayer';

export interface AudioUploaderProps {
  songTitle?: string;
  songUrl?: string;
  onSongTitleChange?: (title: string) => void;
  onSongUrlChange?: (url: string) => void;
  label?: string;
  idPrefix?: string;
  disabled?: boolean;
  allowExternalUrl?: boolean;
  allowTitleInput?: boolean;
  compact?: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  songTitle = '',
  songUrl = '',
  onSongTitleChange,
  onSongUrlChange,
  label = 'Attached Soundtrack / Music',
  idPrefix = 'audio',
  disabled = false,
  allowExternalUrl = false,
  allowTitleInput = true,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'upload' | 'link'>(() => {
    const prov = detectAudioProvider(songUrl);
    return prov === 'spotify' || prov === 'youtube' || prov === 'apple_music' || prov === 'soundcloud'
      ? 'link'
      : 'upload';
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileDuration, setFileDuration] = useState<number>(0);

  const provider: ExternalMusicProvider = detectAudioProvider(songUrl);

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || disabled) return;

    const file = files[0];
    setErrorMessage(null);

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid audio file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      // Auto-suggest song title from filename if empty
      if (!songTitle && onSongTitleChange) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '') // remove extension
          .replace(/[_-]/g, ' ')   // replace dashes/underscores with spaces
          .trim();
        onSongTitleChange(cleanName);
      }

      // Upload directly to Supabase 'audio' storage bucket
      const uploadResult = await uploadAudioFileToStorage(
        file,
        'tracks',
        undefined,
        (progress) => setUploadProgress(progress)
      );

      setFileDuration(uploadResult.duration);
      // Store the uploaded file's Storage PATH in the database (e.g. "userId/tracks/172382-abcd.mp3")
      onSongUrlChange?.(uploadResult.path);
      setUploadProgress(100);
    } catch (err: any) {
      console.error('Audio upload error:', err);
      setErrorMessage(err.message || 'Error uploading audio file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAudio = () => {
    setFileName('');
    setFileDuration(0);
    setErrorMessage(null);
    onSongUrlChange?.('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-[#EADFD5] uppercase tracking-wider flex items-center gap-1.5">
          <Music className="h-3.5 w-3.5 text-[#DFBF99]" />
          <span>{label}</span>
        </label>

        {allowExternalUrl && (
          <div className="flex items-center gap-1 rounded-lg bg-[#140616] p-0.5 border border-[#DFBF99]/15 text-[10px]">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                mode === 'upload'
                  ? 'bg-[#7D2146] text-[#FAF7F2] shadow-sm'
                  : 'text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              Upload Audio
            </button>
            <button
              type="button"
              onClick={() => setMode('link')}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                mode === 'link'
                  ? 'bg-[#7D2146] text-[#FAF7F2] shadow-sm'
                  : 'text-[#C9B7C3] hover:text-[#FAF7F2]'
              }`}
            >
              Music Link
            </button>
          </div>
        )}
      </div>

      {/* Title Field if enabled */}
      {allowTitleInput && onSongTitleChange && (
        <div>
          <input
            type="text"
            value={songTitle}
            onChange={(e) => onSongTitleChange(e.target.value)}
            disabled={disabled}
            placeholder="Track Title (e.g. Clair de Lune, Our First Dance)"
            className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#140616] px-3.5 py-2 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none transition"
          />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/60 border border-rose-600/30 p-2.5 text-xs text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mode 1: DIRECT UPLOAD */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            id={`${idPrefix}-file-input`}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
            onChange={handleFileSelection}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {songUrl ? (
            /* Uploaded Audio Card with Full Controls */
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-[11px] font-mono text-[#DFBF99]/90 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[220px] text-[#FAF7F2]">
                    {fileName || (songTitle ? `${songTitle}.mp3` : 'Attached Audio Track')}
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="flex items-center gap-1 text-[11px] text-[#DFBF99] hover:text-[#FAF7F2] px-2 py-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
                    title="Replace with another audio file"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAudio}
                    disabled={disabled || isUploading}
                    className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200 px-2 py-1 rounded-lg hover:bg-rose-950/40 transition cursor-pointer"
                    title="Remove audio"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>

              {/* Full Audio Player with Play/Pause, Progress bar, Current time / duration, Volume, Mute */}
              <UnifiedAudioPlayer
                url={songUrl}
                title={songTitle || fileName || 'Attached Audio Track'}
                subtitle="Attached Soundtrack"
                idPrefix={`${idPrefix}-preview`}
                showVolume={true}
              />
            </div>
          ) : (
            /* Upload Drop Area */
            <div>
              {isUploading ? (
                <div className="rounded-xl border border-dashed border-[#DFBF99]/40 bg-[#140616] p-4 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#DFBF99] mb-2" />
                  <span className="text-xs text-[#FAF7F2] font-medium block mb-1">
                    Uploading Audio to Supabase... {uploadProgress}%
                  </span>
                  <div className="h-1.5 w-48 max-w-full mx-auto rounded-full bg-[#250E28] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#DFBF99] to-[#FAF7F2] transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id={`${idPrefix}-upload-trigger`}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="w-full rounded-xl border border-dashed border-[#DFBF99]/30 bg-[#160718] p-4 text-center hover:border-[#DFBF99]/60 hover:bg-[#200922] transition group cursor-pointer"
                >
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#2A0E2E] text-[#DFBF99] group-hover:scale-110 transition border border-[#DFBF99]/20">
                    <Upload className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-[#FAF7F2] block mb-0.5">
                    Choose Audio File from Device
                  </span>
                  <span className="text-[10px] text-[#A896A4] block font-mono">
                    Supports MP3, WAV, M4A, OGG &bull; Up to 35MB
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: EXTERNAL MUSIC LINK */}
      {mode === 'link' && allowExternalUrl && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={songUrl}
              onChange={(e) => onSongUrlChange?.(e.target.value)}
              disabled={disabled}
              placeholder="Paste Spotify, YouTube, or Apple Music link..."
              className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#140616] pl-9 pr-8 py-2 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none transition"
            />
            <div className="absolute left-3 top-2.5 text-[#DFBF99]/70">
              {provider === 'spotify' ? (
                <Disc className="h-4 w-4 text-[#1DB954]" />
              ) : provider === 'youtube' ? (
                <Radio className="h-4 w-4 text-red-400" />
              ) : (
                <ExternalLink className="h-4 w-4 text-[#DFBF99]" />
              )}
            </div>
            {songUrl && (
              <button
                type="button"
                onClick={handleRemoveAudio}
                className="absolute right-2.5 top-2.5 text-[#DFBF99]/60 hover:text-rose-400"
                title="Clear URL"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Provider Recognition Badge */}
          {provider !== 'none' && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#DFBF99]/90 font-mono px-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>
                {provider === 'spotify' && 'Spotify Track link recognized (embed player ready)'}
                {provider === 'youtube' && 'YouTube Music/Video recognized (embed player ready)'}
                {provider === 'apple_music' && 'Apple Music link detected'}
                {provider === 'soundcloud' && 'SoundCloud track recognized'}
                {provider === 'direct_audio' && 'Direct audio link recognized'}
                {provider === 'unknown' && 'Custom web stream link attached'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
