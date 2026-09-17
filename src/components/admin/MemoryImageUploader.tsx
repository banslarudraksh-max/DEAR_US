import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Plus
} from 'lucide-react';
import { UploadPhotoItem, validateImageFile } from '../../services/storageService';

export interface MemoryImageUploaderProps {
  photos: UploadPhotoItem[];
  onChange: (photos: UploadPhotoItem[]) => void;
  disabled?: boolean;
  singleMode?: boolean;
  label?: string;
  subtitle?: string;
  maxSizeMb?: number;
  idPrefix?: string;
}

export const MemoryImageUploader: React.FC<MemoryImageUploaderProps> = ({
  photos,
  onChange,
  disabled = false,
  singleMode = false,
  label,
  subtitle,
  maxSizeMb = 10,
  idPrefix = 'memory',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || disabled) return;
    setErrorMessage(null);

    if (singleMode) {
      const file = Array.from(fileList)[0];
      if (!file) return;

      const validation = validateImageFile(file, maxSizeMb);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file');
        return;
      }

      // Clean up previous blob URL if any
      photos.forEach((p) => {
        if (p.previewUrl && p.previewUrl.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(p.previewUrl);
          } catch {
            // ignore
          }
        }
      });

      const previewUrl = URL.createObjectURL(file);
      const newItem: UploadPhotoItem = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        status: 'pending',
        progress: 0,
        isExisting: false,
      };

      onChange([newItem]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const newItems: UploadPhotoItem[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      const validation = validateImageFile(file, maxSizeMb);
      if (!validation.valid) {
        errors.push(validation.error || 'Invalid file');
        return;
      }

      // Create browser blob preview URL for instant, zero-latency thumbnail display
      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        status: 'pending',
        progress: 0,
        isExisting: false,
      });
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(' '));
    }

    if (newItems.length > 0) {
      onChange([...photos, ...newItems]);
    }

    // Reset input so selecting the same file again triggers change event
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    const updated = [...photos];
    const removed = updated.splice(index, 1)[0];
    if (removed && removed.previewUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(removed.previewUrl);
      } catch {
        // ignore
      }
    }
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (disabled || index === 0) return;
    const updated = [...photos];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onChange(updated);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (disabled || toIndex < 0 || toIndex >= photos.length || fromIndex === toIndex) return;
    const updated = [...photos];
    const [item] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);
    onChange(updated);
  };

  // Drag-and-drop reorder handlers for desktop
  const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || disabled) return;
    handleMove(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4" id={`${idPrefix}-image-uploader`}>
      {/* Hidden File Input for Device/Gallery Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/heic,image/heif,image/avif"
        multiple={!singleMode}
        className="hidden"
        id={`${idPrefix}-photo-file-input`}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {/* Error Banner */}
      {errorMessage && (
        <div
          id={`${idPrefix}-upload-error-banner`}
          className="flex items-start gap-2.5 p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 text-xs sm:text-sm leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold text-rose-300 hover:text-white underline ml-2 shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SINGLE MODE: Empty Dropzone or Single Image Preview with Remove & Replace */}
      {singleMode ? (
        photos.length === 0 ? (
          <div
            id={`${idPrefix}-photo-dropzone`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all duration-200 select-none ${
              disabled
                ? 'opacity-60 cursor-not-allowed bg-[#120514]/40 border-[#DFBF99]/15'
                : isDragging
                ? 'border-[#DFBF99] bg-[#2A0D2E]/70 shadow-lg ring-2 ring-[#DFBF99]/40'
                : 'border-[#DFBF99]/30 hover:border-[#DFBF99]/70 bg-[#140516]/80 hover:bg-[#1E0821]'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2.5">
              <div className="w-13 h-13 rounded-2xl bg-[#250D29] border border-[#DFBF99]/30 flex items-center justify-center text-[#DFBF99] shadow-inner transition-transform group-hover:scale-105">
                <Upload className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="editorial-title text-base sm:text-lg font-normal text-[#FAF7F2] tracking-wide">
                  {label || 'Upload Photo'}
                </h4>
                <p className="text-xs text-[#C9B7C3] mt-0.5">
                  {subtitle || 'Choose from your device'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] text-[#DFBF99]/90 font-mono">
                <span className="px-2.5 py-0.5 bg-[#200A23] border border-[#DFBF99]/20 rounded-full">
                  Phone Gallery &amp; Desktop
                </span>
                <span className="px-2.5 py-0.5 bg-[#200A23] border border-[#DFBF99]/20 rounded-full">
                  JPG, PNG, WEBP, HEIC
                </span>
                <span className="px-2.5 py-0.5 bg-[#200A23] border border-[#DFBF99]/20 rounded-full">
                  Up to {maxSizeMb}MB
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Single Image Preview with Touch-Friendly Remove & Replace */
          <div className="space-y-3" id={`${idPrefix}-single-preview-card`}>
            <div className="relative w-full max-w-sm mx-auto aspect-video sm:aspect-4/3 rounded-2xl overflow-hidden border-2 border-[#DFBF99]/35 bg-[#0D030F] shadow-lg group">
              <img
                src={photos[0].previewUrl}
                alt="Selected preview"
                className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />

              {/* Gradient Overlay for Badges */}
              <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Ready / Existing Status Badge */}
              {photos[0].status === 'success' && (
                <div className="absolute top-2.5 left-2.5 bg-emerald-900/80 border border-emerald-400/40 text-emerald-200 text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  <span>{photos[0].isExisting ? 'Current Photo' : 'Ready'}</span>
                </div>
              )}

              {/* Uploading Status Overlay */}
              {photos[0].status === 'uploading' && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4">
                  <Loader2 className="w-7 h-7 animate-spin text-[#DFBF99] mb-2" />
                  <span className="text-xs font-medium text-[#FAF7F2]">Uploading to Vault...</span>
                  <div className="w-3/4 max-w-[200px] h-1.5 bg-white/20 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#DFBF99] to-[#E5A869] transition-all duration-200"
                      style={{ width: `${photos[0].progress || 50}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Status Overlay */}
              {photos[0].status === 'error' && (
                <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-4 text-center">
                  <AlertCircle className="w-6 h-6 text-rose-300 mb-1.5" />
                  <span className="text-xs font-medium text-rose-100">
                    {photos[0].error || 'Upload error'}
                  </span>
                </div>
              )}

              {/* Quick Remove in Top Right */}
              <button
                type="button"
                id={`${idPrefix}-btn-quick-remove`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(0);
                }}
                disabled={disabled}
                aria-label="Remove photo"
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/75 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md focus:outline-none cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons: Remove & Replace (Minimum 44px touch targets on mobile) */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                id={`${idPrefix}-btn-remove`}
                onClick={() => handleRemove(0)}
                disabled={disabled}
                className="min-h-[44px] px-5 py-2 rounded-xl border border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/50 text-rose-200 text-xs font-medium transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Remove</span>
              </button>

              <button
                type="button"
                id={`${idPrefix}-btn-replace`}
                onClick={() => !disabled && fileInputRef.current?.click()}
                disabled={disabled}
                className="min-h-[44px] px-5 py-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] hover:brightness-110 text-[#FAF7F2] text-xs font-medium transition active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#DFBF99]" />
                <span>Replace</span>
              </button>
            </div>
          </div>
        )
      ) : (
        /* MULTI MODE: Dropzone */
        <>
          <div
            id={`${idPrefix}-photo-dropzone`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all duration-200 select-none ${
              disabled
                ? 'opacity-60 cursor-not-allowed bg-[#120514]/40 border-[#DFBF99]/15'
                : isDragging
                ? 'border-[#DFBF99] bg-[#2A0D2E]/70 shadow-lg ring-2 ring-[#DFBF99]/40'
                : 'border-[#DFBF99]/30 hover:border-[#DFBF99]/70 bg-[#140516]/80 hover:bg-[#1E0821]'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2.5">
              <div className="w-13 h-13 rounded-2xl bg-[#250D29] border border-[#DFBF99]/30 flex items-center justify-center text-[#DFBF99] shadow-inner transition-transform group-hover:scale-105">
                <Upload className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="editorial-title text-base sm:text-lg font-normal text-[#FAF7F2] tracking-wide">
                  {label || 'Add Photos'}
                </h4>
                <p className="text-xs text-[#C9B7C3] mt-0.5">
                  {subtitle || 'Choose photos from your device, phone gallery, or drag & drop here'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] text-[#DFBF99]/90 font-mono">
                <span className="px-2.5 py-0.5 bg-[#200A23] border border-[#DFBF99]/20 rounded-full">
                  Multiple Photos
                </span>
                <span className="px-2.5 py-0.5 bg-[#200A23] border border-[#DFBF99]/20 rounded-full">
                  JPG, PNG, WEBP, HEIC
                </span>
                <span className="px-2.5 py-0.5 bg-[#200A23] border border-[#DFBF99]/20 rounded-full">
                  Up to {maxSizeMb}MB each
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Multi Mode Selected Photos Grid & Reordering */}
      {!singleMode && photos.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-[#C9B7C3] px-1 font-sans">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#DFBF99]" />
              <span className="text-[#FAF7F2] font-medium">
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'} selected
              </span>
              <span className="text-[#8F7D8A]">•</span>
              <span className="text-[#DFBF99] text-[11px]">First photo is Cover</span>
            </div>
            <button
              type="button"
              id="btn-add-more-photos"
              onClick={() => !disabled && fileInputRef.current?.click()}
              className="text-[#DFBF99] hover:text-[#FAF7F2] font-medium text-xs flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Photos</span>
            </button>
          </div>

          <div
            id="photos-preview-grid"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5"
          >
            {photos.map((photo, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={photo.id}
                  id={`photo-card-${index}`}
                  draggable={!disabled}
                  onDragStart={(e) => handleItemDragStart(e, index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDragEnd={handleItemDragEnd}
                  className={`group relative rounded-2xl overflow-hidden border bg-[#170619] transition-all shadow-md ${
                    isCover
                      ? 'ring-2 ring-[#DFBF99] border-[#DFBF99] shadow-[#DFBF99]/10 shadow-lg'
                      : 'border-[#DFBF99]/20 hover:border-[#DFBF99]/50'
                  }`}
                >
                  {/* Fixed Aspect Ratio Square Container for Equal Dimensions */}
                  <div className="w-full aspect-square relative bg-[#0D030F] overflow-hidden">
                    <img
                      src={photo.previewUrl}
                      alt={`Memory photo ${index + 1}`}
                      className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for Top Badges */}
                    <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

                    {/* Cover Photo Badge */}
                    {isCover && (
                      <div
                        id={`cover-badge-${index}`}
                        className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-[#7D2146] to-[#5C1632] border border-[#DFBF99]/50 text-[#FAF7F2] text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm"
                      >
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <span>Cover</span>
                      </div>
                    )}

                    {/* Upload Status / Progress Indicator */}
                    {photo.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#DFBF99] mb-1.5" />
                        <span className="text-[11px] font-medium text-[#FAF7F2]">Uploading to Vault...</span>
                        <div className="w-3/4 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#DFBF99] to-[#E5A869] transition-all duration-200"
                            style={{ width: `${photo.progress || 50}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {photo.status === 'error' && (
                      <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-2 text-center">
                        <AlertCircle className="w-5 h-5 text-rose-300 mb-1" />
                        <span className="text-[10px] font-medium text-rose-100 line-clamp-2">
                          {photo.error || 'Upload error'}
                        </span>
                      </div>
                    )}

                    {photo.status === 'success' && !isCover && (
                      <div className="absolute top-2 left-2 bg-emerald-900/80 border border-emerald-400/40 text-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                        <span>Ready</span>
                      </div>
                    )}

                    {/* Quick Remove Button */}
                    <button
                      type="button"
                      id={`btn-remove-photo-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      disabled={disabled}
                      aria-label="Remove photo"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-sm focus:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Touch-Friendly Action Bar Below Thumbnail (Optimized for One-Hand Mobile Use) */}
                  <div className="p-1.5 sm:p-2 bg-[#170619] flex items-center justify-between gap-1 border-t border-[#DFBF99]/15">
                    {/* Left Reorder Button */}
                    <button
                      type="button"
                      id={`btn-move-left-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, index - 1);
                      }}
                      disabled={disabled || index === 0}
                      title="Move left / earlier"
                      aria-label="Move left"
                      className={`min-w-[36px] h-8 rounded-lg flex items-center justify-center transition-colors ${
                        index === 0
                          ? 'text-[#8F7D8A]/30 cursor-not-allowed'
                          : 'text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#280D2D] active:bg-[#34113A]'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Set as Cover Button */}
                    {!isCover ? (
                      <button
                        type="button"
                        id={`btn-set-cover-${index}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(index);
                        }}
                        disabled={disabled}
                        className="flex-1 py-1 px-1 rounded-lg text-[11px] font-medium text-[#DFBF99] hover:text-[#FAF7F2] hover:bg-[#280D2D] active:bg-[#34113A] transition-colors flex items-center justify-center gap-1 truncate"
                      >
                        <Star className="w-3 h-3 text-[#DFBF99]" />
                        <span className="truncate">Set Cover</span>
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-[#DFBF99]">
                        <span>★ Cover</span>
                      </div>
                    )}

                    {/* Right Reorder Button */}
                    <button
                      type="button"
                      id={`btn-move-right-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, index + 1);
                      }}
                      disabled={disabled || index === photos.length - 1}
                      title="Move right / later"
                      aria-label="Move right"
                      className={`min-w-[36px] h-8 rounded-lg flex items-center justify-center transition-colors ${
                        index === photos.length - 1
                          ? 'text-[#8F7D8A]/30 cursor-not-allowed'
                          : 'text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#280D2D] active:bg-[#34113A]'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Centered Add More Button */}
          <div className="text-center pt-1">
            <button
              type="button"
              id="btn-add-more-photos-secondary"
              onClick={() => !disabled && fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#DFBF99]/25 bg-[#1F0923] hover:bg-[#2E0F34] text-xs font-medium text-[#FAF7F2] transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#DFBF99]" />
              <span>+ Add More Photos</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
