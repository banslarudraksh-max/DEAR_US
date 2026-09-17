import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1,
  RotateCcw, 
  Music, 
  Mic, 
  ExternalLink,
  Sparkles,
  Disc,
  Radio,
  AlertCircle
} from 'lucide-react';
import { 
  detectAudioProvider, 
  getSpotifyEmbedUrl, 
  getYouTubeEmbedUrl, 
  formatAudioDuration,
  resolveAudioPlaybackUrl,
  isStoragePath,
  ExternalMusicProvider 
} from '../../services/audioStorageService';

export interface UnifiedAudioPlayerProps {
  url?: string;
  title?: string;
  subtitle?: string;
  initialDuration?: number;
  compact?: boolean;
  autoPlay?: boolean;
  className?: string;
  idPrefix?: string;
  showVolume?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const UnifiedAudioPlayer: React.FC<UnifiedAudioPlayerProps> = ({
  url,
  title,
  subtitle,
  initialDuration,
  compact = false,
  autoPlay = false,
  className = '',
  idPrefix = 'audio',
  showVolume = true,
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const provider: ExternalMusicProvider = detectAudioProvider(url);

  // If Spotify or YouTube embed URL available
  const spotifyEmbedUrl = provider === 'spotify' && url ? getSpotifyEmbedUrl(url) : null;
  const youTubeEmbedUrl = provider === 'youtube' && url ? getYouTubeEmbedUrl(url) : null;

  // Handle direct audio files
  const isDirectAudio = provider === 'direct_audio' || provider === 'unknown' || (url && !spotifyEmbedUrl && !youTubeEmbedUrl);

  useEffect(() => {
    if (initialDuration && initialDuration > 0) {
      setDuration(initialDuration);
    }
  }, [initialDuration]);

  // Resolve storage paths to signed URLs
  useEffect(() => {
    let isCancelled = false;
    if (!url) {
      setResolvedUrl('');
      setErrorMessage(null);
      setHasError(false);
      return;
    }

    if (!isDirectAudio) {
      setResolvedUrl(url);
      return;
    }

    setIsResolving(true);
    setErrorMessage(null);
    setHasError(false);

    resolveAudioPlaybackUrl(url)
      .then((signedUrl) => {
        if (!isCancelled) {
          setResolvedUrl(signedUrl);
          setIsResolving(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Could not resolve signed audio URL:', err);
          setErrorMessage(err?.message || 'Unable to generate audio playback URL');
          setHasError(true);
          setIsResolving(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [url, isDirectAudio]);

  // Audio lifecycle setup for direct HTML5 audio
  useEffect(() => {
    if (!isDirectAudio || !resolvedUrl) return;

    setHasError(false);
    setErrorMessage(null);
    setIsLoaded(false);

    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'auto';
    audio.volume = isMuted ? 0 : (volume > 0 ? volume : 0.85);
    audio.muted = isMuted;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(Math.round(audio.duration));
      }
      setIsLoaded(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onPlayStateChange?.(false);
    };

    const handleError = () => {
      const code = audio.error?.code;
      let detail = 'Audio playback error';
      if (code === 1) detail = 'Playback aborted by browser';
      else if (code === 2) detail = 'Network error downloading audio';
      else if (code === 3) detail = 'Audio decode error (corrupt file or format issue)';
      else if (code === 4) detail = 'Audio format not supported or signed URL expired';
      
      console.warn('HTML5 Audio error encountered:', code, detail);
      setErrorMessage(detail);
      setHasError(true);
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audio.src = resolvedUrl;

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.src = '';
      audioRef.current = null;
    };
  }, [resolvedUrl, isDirectAudio]);

  const handleRetry = async () => {
    if (!url) return;
    setHasError(false);
    setErrorMessage(null);
    setIsResolving(true);
    try {
      const freshUrl = await resolveAudioPlaybackUrl(url, true);
      setResolvedUrl(freshUrl);
      if (audioRef.current) {
        audioRef.current.src = freshUrl;
        audioRef.current.load();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to refresh playback URL');
      setHasError(true);
    } finally {
      setIsResolving(false);
    }
  };

  const togglePlay = async () => {
    if (!url) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
      return;
    }

    setHasError(false);
    setErrorMessage(null);

    let activeAudio = audioRef.current;
    let targetUrl = resolvedUrl;

    // If resolved URL is not ready yet or was errored, resolve immediately
    if (!targetUrl || hasError) {
      setIsResolving(true);
      try {
        targetUrl = await resolveAudioPlaybackUrl(url, hasError);
        setResolvedUrl(targetUrl);
      } catch (err: any) {
        setIsResolving(false);
        setErrorMessage(err?.message || 'Failed to generate signed playback URL');
        setHasError(true);
        return;
      } finally {
        setIsResolving(false);
      }
    }

    if (!activeAudio) {
      activeAudio = new Audio();
      audioRef.current = activeAudio;
    }

    if (activeAudio.src !== targetUrl) {
      activeAudio.src = targetUrl;
    }

    // Guarantee audio is unmuted and volume is audible (non-zero)
    const effectiveVolume = isMuted ? 0 : Math.max(0.1, volume > 0 ? volume : 0.85);
    activeAudio.muted = isMuted;
    activeAudio.volume = effectiveVolume;

    try {
      // Direct invocation in the tap gesture handles mobile browser autoplay permissions
      const playPromise = activeAudio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      setIsPlaying(true);
      onPlayStateChange?.(true);
    } catch (err: any) {
      console.warn('Playback error on play():', err);
      let msg = 'Playback failed. Tap to retry.';
      if (err?.name === 'NotAllowedError') {
        msg = 'Playback paused by browser policy. Tap Play again.';
      } else if (err?.name === 'NotSupportedError') {
        msg = 'Audio format not supported by browser.';
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      setHasError(true);
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  };

  const handleSeek = (clientX: number) => {
    if (!progressRef.current || !duration || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = clickPos * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleSeek(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSeek(moveEvent.clientX);
    };

    const onMouseUp = () => {
      setIsSeeking(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleProgressTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    if (e.touches[0]) {
      handleSeek(e.touches[0].clientX);
    }

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches[0]) {
        handleSeek(moveEvent.touches[0].clientX);
      }
    };

    const onTouchEnd = () => {
      setIsSeeking(false);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume || 0.85;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Render Spotify Embed if external Spotify link
  if (provider === 'spotify' && spotifyEmbedUrl) {
    return (
      <div className={`rounded-2xl border border-[#DFBF99]/25 bg-[#17091A] p-3 shadow-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-2 px-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
              <Disc className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#DFBF99]/80 block">Spotify Soundtrack</span>
              <span className="font-serif text-[#FAF7F2] font-medium">{title || 'Connected Track'}</span>
            </div>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[#250E28] px-2.5 py-1 text-[10px] font-sans text-[#DFBF99] hover:text-[#FAF7F2] border border-[#DFBF99]/20 transition hover:bg-[#321338]"
            >
              <span>Open in Spotify</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
        <div className="rounded-xl overflow-hidden bg-black/40 border border-white/5">
          <iframe
            src={spotifyEmbedUrl}
            width="100%"
            height={compact ? '80' : '152'}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={title || 'Spotify Player'}
            className="rounded-xl w-full"
          />
        </div>
      </div>
    );
  }

  // Render YouTube Embed if external YouTube link
  if (provider === 'youtube' && youTubeEmbedUrl) {
    return (
      <div className={`rounded-2xl border border-[#DFBF99]/25 bg-[#17091A] p-3 shadow-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-2 px-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
              <Radio className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#DFBF99]/80 block">YouTube Soundtrack</span>
              <span className="font-serif text-[#FAF7F2] font-medium">{title || 'Connected Song'}</span>
            </div>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[#250E28] px-2.5 py-1 text-[10px] font-sans text-[#DFBF99] hover:text-[#FAF7F2] border border-[#DFBF99]/20 transition hover:bg-[#321338]"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
        <div className="relative rounded-xl overflow-hidden bg-black/60 aspect-video max-h-48 border border-white/5">
          <iframe
            src={youTubeEmbedUrl}
            title={title || 'YouTube Player'}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // If Apple Music / SoundCloud external link without direct streaming
  if ((provider === 'apple_music' || provider === 'soundcloud') && url) {
    return (
      <div className={`flex items-center justify-between gap-3 rounded-xl border border-[#DFBF99]/25 bg-[#1B0B1E]/90 p-3 shadow-md backdrop-blur-md ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7D2146]/40 text-[#DFBF99] border border-[#DFBF99]/25">
            <Music className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#DFBF99]/70 block font-mono">
              {provider === 'apple_music' ? 'Apple Music' : 'SoundCloud'} Soundtrack
            </span>
            <span className="font-serif text-sm text-[#FAF7F2] font-medium">{title || 'Special Track'}</span>
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7D2146] to-[#8B264E] px-3 py-1.5 text-xs text-[#FAF7F2] border border-[#DFBF99]/30 hover:scale-105 transition"
        >
          <span>Listen</span>
          <ExternalLink className="h-3 w-3 text-[#DFBF99]" />
        </a>
      </div>
    );
  }

  // Compact Audio Player (pill style)
  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-4 py-2 text-xs backdrop-blur-md font-sans shadow-md ${className}`}>
        <button
          id={`${idPrefix}-compact-play-btn`}
          onClick={togglePlay}
          disabled={!url || hasError}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#7D2146] to-[#8B264E] text-[#FAF7F2] border border-[#DFBF99]/40 transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Music className="h-3 w-3 text-[#DFBF99] shrink-0" />
              <span className="font-medium text-[#FAF7F2] truncate">{title || 'Attached Soundtrack'}</span>
            </div>
            <span className="text-[10px] font-mono text-[#DFBF99]/80 shrink-0">
              {formatAudioDuration(currentTime)} / {formatAudioDuration(duration)}
            </span>
          </div>

          {/* Interactive Seek Bar */}
          <div
            ref={progressRef}
            onMouseDown={handleProgressMouseDown}
            onTouchStart={handleProgressTouchStart}
            className="group relative h-2.5 w-full cursor-pointer flex items-center py-1"
          >
            <div className="h-1.5 w-full rounded-full bg-[#17091A] border border-[#DFBF99]/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#DFBF99] to-[#EADFD5] transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Animated equalizer bars when playing */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-3 shrink-0">
            <div className="w-1 bg-[#DFBF99] animate-[bounce_0.6s_infinite_ease-in-out] rounded-full h-full" />
            <div className="w-1 bg-[#DFBF99] animate-[bounce_0.8s_infinite_ease-in-out_0.2s] rounded-full h-3/4" />
            <div className="w-1 bg-[#DFBF99] animate-[bounce_0.5s_infinite_ease-in-out_0.1s] rounded-full h-1/2" />
          </div>
        )}
      </div>
    );
  }

  // Full High-Polish Audio Player
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#DFBF99]/30 bg-gradient-to-b from-[#220B26] via-[#1B0B1E] to-[#140717] p-4 sm:p-5 shadow-xl backdrop-blur-xl font-sans ${className}`}>
      {/* Decorative subtle gold light glow */}
      <div className="absolute top-0 right-0 h-28 w-28 -mr-10 -mt-10 bg-[#DFBF99]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DFBF99]/30 shadow-md ${
            isPlaying 
              ? 'bg-[#7D2146] text-[#FAF7F2] ring-2 ring-[#DFBF99]/40 animate-pulse' 
              : 'bg-[#2A0E2E] text-[#DFBF99]'
          }`}>
            <Music className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#DFBF99]/70 block">
              {subtitle || 'Soundtrack of Us'}
            </span>
            <h4 className="font-serif text-base sm:text-lg text-[#FAF7F2] font-normal truncate">
              {title || 'Sacred Memory Song'}
            </h4>
          </div>
        </div>

        {/* Animated Waveform Indicator */}
        <div className="flex items-center gap-1 shrink-0 h-4">
          {[40, 75, 100, 60, 90, 45, 80].map((height, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-all duration-300 ${
                isPlaying 
                  ? 'bg-[#DFBF99]' 
                  : 'bg-[#DFBF99]/30'
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, (height / 100) * 16)}px` : '4px',
                animation: isPlaying ? `pulse 0.7s ease-in-out ${i * 0.1}s infinite alternate` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-rose-950/60 border border-rose-600/40 p-2.5 mb-3 text-xs text-rose-200">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span className="truncate">{errorMessage || 'Unable to play audio stream. Check network connection or audio source.'}</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 rounded-lg bg-rose-900/60 hover:bg-rose-800/80 px-2.5 py-1 text-[11px] font-medium text-rose-100 transition border border-rose-700/50 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Interactive Progress Bar */}
      <div className="mb-2">
        <div
          ref={progressRef}
          onMouseDown={handleProgressMouseDown}
          onTouchStart={handleProgressTouchStart}
          className="group relative h-4 w-full cursor-pointer flex items-center py-1 select-none"
        >
          <div className="h-2 w-full rounded-full bg-[#120514] border border-[#DFBF99]/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#DFBF99] via-[#E8D4BE] to-[#FAF7F2] transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Draggable thumb */}
          <div
            className="absolute h-4 w-4 -ml-2 rounded-full border border-[#DFBF99] bg-[#FAF7F2] shadow-md transition-transform scale-0 group-hover:scale-100"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Timers */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#DFBF99]/80 px-0.5">
          <span>{formatAudioDuration(currentTime)}</span>
          <span>{formatAudioDuration(duration)}</span>
        </div>
      </div>

      {/* Control Buttons Strip */}
      <div className="flex items-center justify-between pt-2 border-t border-[#DFBF99]/15">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            id={`${idPrefix}-main-play-btn`}
            onClick={togglePlay}
            disabled={!url}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#6E1C3D] text-[#FAF7F2] border border-[#DFBF99]/40 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>

          {/* Restart Button */}
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#250E28] text-[#C9B7C3] hover:text-[#FAF7F2] border border-[#DFBF99]/20 transition hover:bg-[#321338]"
            title="Restart Track"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Volume & Details */}
        {showVolume && (
          <div className="relative flex items-center gap-2">
            <button
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="p-1.5 text-[#DFBF99]/80 hover:text-[#FAF7F2] transition rounded-lg hover:bg-white/5"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-rose-300" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            {/* Volume Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-[#DFBF99] h-1.5 rounded-lg bg-[#140616] cursor-pointer"
              title={`Volume ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Aliased voice note player that delegates to UnifiedAudioPlayer
export const VoiceNotePlayer: React.FC<{
  url?: string;
  duration?: number;
  label?: string;
}> = ({ url, duration, label = 'Voice Recording' }) => {
  return (
    <UnifiedAudioPlayer
      url={url}
      title={label}
      subtitle="Whispered Audio Note"
      initialDuration={duration}
      compact={true}
      idPrefix="voice-note"
    />
  );
};

// Ambient Soft Tone Synthesizer for Romantic Atmosphere
export const AmbientSoundtrack: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const startAmbientSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.04, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Soft warm chords (Fmaj9, Cmaj7 gentle tones)
      const frequencies = [174.61, 220.00, 261.63, 329.63]; // F3, A3, C4, E4
      const oscs: OscillatorNode[] = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.25, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.05, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.1, ctx.currentTime);
        lfo.connect(lfoGain.gain);
        lfo.start();

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      oscillatorsRef.current = oscs;
      setIsPlaying(true);
    } catch (e) {
      console.warn('Web Audio Ambient error:', e);
    }
  };

  const stopAmbientSound = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
      oscillatorsRef.current = [];
    }
    setIsPlaying(false);
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  return (
    <button
      id="ambient-sound-toggle-btn"
      onClick={toggleSound}
      title={isPlaying ? 'Pause Ambient Atmosphere' : 'Play Ambient Atmosphere'}
      className="flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/70 px-3.5 py-1.5 text-xs text-[#DFBF99] transition hover:bg-[#341238] hover:border-[#DFBF99]/50 backdrop-blur-md font-sans"
    >
      {isPlaying ? (
        <>
          <Volume2 className="h-3.5 w-3.5 animate-pulse text-[#DFBF99]" />
          <span className="hidden sm:inline font-medium">Soundscape: Cinematic Warmth</span>
          <span className="sm:hidden font-medium">Harmonics On</span>
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Play Ambient Sound</span>
          <span className="sm:hidden">Harmonics</span>
        </>
      )}
    </button>
  );
};

// Floating ambient atmosphere player for global soundscape
export const AudioPlayer: React.FC = () => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
      <AmbientSoundtrack />
    </div>
  );
};

