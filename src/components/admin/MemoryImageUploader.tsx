import React, { useEffect, useRef, useState } from 'react';
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
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Crop,
  Check,
  Move,
} from 'lucide-react';
import {
  UploadPhotoItem,
  validateImageFile,
} from '../../services/storageService';

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

/* -------------------------------------------------------------------------- */
/*                              IMAGE CROP MODAL                              */
/* -------------------------------------------------------------------------- */

interface ImageCropModalProps {
  file: File;
  onCancel: () => void;
  onConfirm: (croppedFile: File, previewUrl: string) => void;
}
const ImageCropModal: React.FC<ImageCropModalProps> = ({
  file,
  onCancel,
  onConfirm,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
    positionX: 0,
    positionY: 0,
  });

  /*
   * 4:3 crop area.
   * This gives considerably more vertical space than the old
   * 320 x 320 square crop.
   */
  const CROP_WIDTH = 360;
  const CROP_HEIGHT = 270;

  /*
   * Allow zooming out below 100%.
   * This is the main fix for the "only face is visible" problem.
   */
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;

  useEffect(() => {
    const url = URL.createObjectURL(file);

    setImageUrl(url);
    setImageLoaded(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!imageLoaded) return;

    e.preventDefault();

    setIsDragging(true);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      positionX: position.x,
      positionY: position.y,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture errors.
    }
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isDragging) return;

    e.preventDefault();

    const deltaX =
      e.clientX - dragStartRef.current.x;

    const deltaY =
      e.clientY - dragStartRef.current.y;

    setPosition({
      x: dragStartRef.current.positionX + deltaX,
      y: dragStartRef.current.positionY + deltaY,
    });
  };

  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture errors.
    }
  };

  const handleZoomIn = () => {
    setZoom((current) =>
      Math.min(
        MAX_ZOOM,
        Number((current + 0.1).toFixed(2))
      )
    );
  };

  const handleZoomOut = () => {
    setZoom((current) =>
      Math.max(
        MIN_ZOOM,
        Number((current - 0.1).toFixed(2))
      )
    );
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const createCroppedImage = async () => {
    if (!imageRef.current || !imageLoaded) return;

    const image = imageRef.current;

    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    if (!naturalWidth || !naturalHeight) {
      return;
    }

    /*
     * Base scale makes the image cover the crop frame.
     */
    const baseScale = Math.max(
      CROP_WIDTH / naturalWidth,
      CROP_HEIGHT / naturalHeight
    );

    const finalScale = baseScale * zoom;

    const displayedWidth =
      naturalWidth * finalScale;

    const displayedHeight =
      naturalHeight * finalScale;

    /*
     * Center image and apply user's drag position.
     */
    const imageLeft =
      (CROP_WIDTH - displayedWidth) / 2 +
      position.x;

    const imageTop =
      (CROP_HEIGHT - displayedHeight) / 2 +
      position.y;

    /*
     * Convert crop coordinates back to
     * original image coordinates.
     */
    const sourceX =
      (0 - imageLeft) / finalScale;

    const sourceY =
      (0 - imageTop) / finalScale;

    const sourceWidth =
      CROP_WIDTH / finalScale;

    const sourceHeight =
      CROP_HEIGHT / finalScale;

    /*
     * Keep crop area safely inside the original image.
     */
    const safeSourceX = Math.max(
      0,
      Math.min(
        naturalWidth - sourceWidth,
        sourceX
      )
    );

    const safeSourceY = Math.max(
      0,
      Math.min(
        naturalHeight - sourceHeight,
        sourceY
      )
    );

    const safeSourceWidth = Math.min(
      sourceWidth,
      naturalWidth - safeSourceX
    );

    const safeSourceHeight = Math.min(
      sourceHeight,
      naturalHeight - safeSourceY
    );

    /*
     * Keep the same 4:3 aspect ratio in output.
     */
    const OUTPUT_WIDTH = 1200;
    const OUTPUT_HEIGHT = 900;

    const canvas = document.createElement('canvas');

    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    context.drawImage(
      image,
      safeSourceX,
      safeSourceY,
      safeSourceWidth,
      safeSourceHeight,
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );

    const blob = await new Promise<Blob | null>(
      (resolve) => {
        canvas.toBlob(
          (result) => resolve(result),
          'image/jpeg',
          0.92
        );
      }
    );

    if (!blob) {
      return;
    }

    const baseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(
        /[^a-zA-Z0-9-_]/g,
        '-'
      );

    const croppedFile = new File(
      [blob],
      `${baseName}-cropped.jpg`,
      {
        type: 'image/jpeg',
        lastModified: Date.now(),
      }
    );

    const previewUrl =
      URL.createObjectURL(blob);

    onConfirm(
      croppedFile,
      previewUrl
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Adjust photo"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl max-h-[95vh] overflow-y-auto rounded-3xl border border-[#DFBF99]/25 bg-[#110411] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DFBF99]/15">
          <div>
            <div className="flex items-center gap-2">
              <Crop className="w-5 h-5 text-[#DFBF99]" />

              <h3 className="text-base sm:text-lg font-medium text-[#FAF7F2]">
                Adjust Photo
              </h3>
            </div>

            <p className="text-[11px] text-[#AFA0AA] mt-1">
              Drag the photo and zoom to choose exactly what you want.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#C9B7C3] hover:text-white hover:bg-white/10 transition"
            aria-label="Close crop editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop workspace */}
        <div className="px-4 pt-5">

          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-2xl bg-[#080208] border border-[#DFBF99]/25 shadow-inner select-none touch-none"
              style={{
                width: CROP_WIDTH,
                height: CROP_HEIGHT,
                maxWidth: 'calc(100vw - 40px)',
                maxHeight: 'calc(100vw - 70px)',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={(e) => {
                if (isDragging) {
                  handlePointerUp(e);
                }
              }}
            >

              {/* Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#321238_0%,#0A020B_70%)]" />

              {/* Image */}
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Photo being cropped"
                  onLoad={handleImageLoad}
                  draggable={false}
                  className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
                  style={{
                    width: 'auto',
                    height: 'auto',

                    /*
                     * Do NOT force min-width/min-height here.
                     * Those were contributing to the overly
                     * zoomed feeling.
                     */
                    transform: `
                      translate(-50%, -50%)
                      translate(${position.x}px, ${position.y}px)
                      scale(${zoom})
                    `,
                    transformOrigin:
                      'center center',
                  }}
                />
              )}

              {/* Crop frame */}
              <div className="absolute inset-0 pointer-events-none">

                {/* Dark outside area */}
                <div className="absolute inset-0 ring-[999px] ring-black/45" />

                {/* Inner frame */}
                <div className="absolute inset-3 border border-white/30 rounded-lg" />

                {/* Corner guides */}
                <div className="absolute top-3 left-3 w-7 h-7 border-l-2 border-t-2 border-[#DFBF99]" />

                <div className="absolute top-3 right-3 w-7 h-7 border-r-2 border-t-2 border-[#DFBF99]" />

                <div className="absolute bottom-3 left-3 w-7 h-7 border-l-2 border-b-2 border-[#DFBF99]" />

                <div className="absolute bottom-3 right-3 w-7 h-7 border-r-2 border-b-2 border-[#DFBF99]" />

                {/* Rule of thirds */}
                <div className="absolute left-1/3 top-3 bottom-3 w-px bg-white/15" />

                <div className="absolute left-2/3 top-3 bottom-3 w-px bg-white/15" />

                <div className="absolute top-1/3 left-3 right-3 h-px bg-white/15" />

                <div className="absolute top-2/3 left-3 right-3 h-px bg-white/15" />

                {/* Center indicator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/70 shadow" />
              </div>

              {/* Drag hint */}
              {!isDragging &&
                imageLoaded &&
                zoom === 1 &&
                position.x === 0 &&
                position.y === 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 border border-white/10 backdrop-blur-sm text-[10px] text-white/80">
                      <Move className="w-3 h-3" />
                      <span>
                        Drag to position
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-3 mt-5">

            {/* Zoom out */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={
                !imageLoaded ||
                zoom <= MIN_ZOOM
              }
              className="w-11 h-11 rounded-xl border border-[#DFBF99]/25 bg-[#1C071F] text-[#DFBF99] flex items-center justify-center hover:bg-[#2A0C30] disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            {/* Zoom percentage */}
            <div className="min-w-[110px] text-center">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#8F7D8A]">
                Zoom
              </div>

              <div className="text-sm font-medium text-[#FAF7F2] mt-0.5">
                {Math.round(zoom * 100)}%
              </div>
            </div>

            {/* Zoom in */}
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={
                !imageLoaded ||
                zoom >= MAX_ZOOM
              }
              className="w-11 h-11 rounded-xl border border-[#DFBF99]/25 bg-[#1C071F] text-[#DFBF99] flex items-center justify-center hover:bg-[#2A0C30] disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              disabled={!imageLoaded}
              className="w-11 h-11 rounded-xl border border-[#DFBF99]/20 bg-[#170619] text-[#C9B7C3] flex items-center justify-center hover:bg-[#260C2B] disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Reset photo position"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom slider */}
          <div className="mt-4 px-2">
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) =>
                setZoom(
                  Number(e.target.value)
                )
              }
              disabled={!imageLoaded}
              className="w-full accent-[#DFBF99] cursor-pointer disabled:opacity-30"
              aria-label="Photo zoom"
            />
          </div>

          {/* Hint */}
          <div className="mt-4 rounded-xl border border-[#DFBF99]/10 bg-[#18061B]/70 px-3.5 py-3">
            <p className="text-[11px] leading-relaxed text-[#AFA0AA] text-center">
              Drag the photo to position it.
              Use the slider or buttons to
              zoom in or out. Everything inside
              the frame will be saved.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 mt-2 border-t border-[#DFBF99]/15">

          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-5 rounded-xl border border-white/10 bg-white/5 text-[#C9B7C3] hover:text-white hover:bg-white/10 text-xs font-medium transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={createCroppedImage}
            disabled={!imageLoaded}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-[#7D2146] to-[#5C1632] border border-[#DFBF99]/30 text-[#FAF7F2] text-xs font-medium flex items-center gap-2 shadow-lg hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Check className="w-4 h-4 text-[#DFBF99]" />
            Use This Photo
          </button>
        </div>
      </div>
    </div>
  );
};
/* -------------------------------------------------------------------------- */
/*                         MEMORY IMAGE UPLOADER                              */
/* -------------------------------------------------------------------------- */

export const MemoryImageUploader: React.FC<
  MemoryImageUploaderProps
> = ({
  photos,
  onChange,
  disabled = false,
  singleMode = false,
  label,
  subtitle,
  maxSizeMb = 10,
  idPrefix = 'memory',
}) => {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [draggedIndex, setDraggedIndex] =
    useState<number | null>(null);

  /* Crop queue */
  const [cropQueue, setCropQueue] =
    useState<File[]>([]);

  const [cropIndex, setCropIndex] =
    useState(0);

  const [isCropOpen, setIsCropOpen] =
    useState(false);

  const currentCropFile =
    cropQueue[cropIndex] || null;

  const openCropQueue = (files: File[]) => {
    if (!files.length) return;

    setCropQueue(files);
    setCropIndex(0);
    setIsCropOpen(true);
  };

  const finishCropQueue = () => {
    setCropQueue([]);
    setCropIndex(0);
    setIsCropOpen(false);
  };

  const handleCropConfirm = (
    croppedFile: File,
    previewUrl: string
  ) => {
    const newItem: UploadPhotoItem = {
      id: `upload-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)}`,

      file: croppedFile,

      previewUrl,

      status: 'pending',

      progress: 0,

      isExisting: false,
    };

    if (singleMode) {
      photos.forEach((p) => {
        if (
          p.previewUrl &&
          p.previewUrl.startsWith('blob:')
        ) {
          try {
            URL.revokeObjectURL(p.previewUrl);
          } catch {
            // ignore
          }
        }
      });

      onChange([newItem]);
      finishCropQueue();
      return;
    }

    onChange([...photos, newItem]);

    const nextIndex = cropIndex + 1;

    if (nextIndex < cropQueue.length) {
      setCropIndex(nextIndex);
    } else {
      finishCropQueue();
    }
  };

  const handleFiles = (
    fileList: FileList | null
  ) => {
    if (
      !fileList ||
      fileList.length === 0 ||
      disabled
    ) {
      return;
    }

    setErrorMessage(null);

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      const validation =
        validateImageFile(file, maxSizeMb);

      if (!validation.valid) {
        errors.push(
          validation.error || 'Invalid file'
        );
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(' '));
    }

    if (validFiles.length > 0) {
      /*
       * IMPORTANT:
       * Do not directly add the original file.
       * Open crop editor first.
       */
      if (singleMode) {
        openCropQueue([validFiles[0]]);
      } else {
        openCropQueue(validFiles);
      }
    }

    /*
     * Reset input so selecting the same image again
     * triggers the change event.
     */
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    setIsDragging(false);

    if (disabled) return;

    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
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

    if (
      removed &&
      removed.previewUrl &&
      removed.previewUrl.startsWith('blob:')
    ) {
      try {
        URL.revokeObjectURL(
          removed.previewUrl
        );
      } catch {
        // ignore
      }
    }

    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (
      disabled ||
      index === 0
    ) {
      return;
    }

    const updated = [...photos];

    const [selected] =
      updated.splice(index, 1);

    updated.unshift(selected);

    onChange(updated);
  };

  const handleMove = (
    fromIndex: number,
    toIndex: number
  ) => {
    if (
      disabled ||
      toIndex < 0 ||
      toIndex >= photos.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const updated = [...photos];

    const [item] =
      updated.splice(fromIndex, 1);

    updated.splice(toIndex, 0, item);

    onChange(updated);
  };
  const handleItemDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    if (disabled) return;

    setDraggedIndex(index);

    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();

    if (
      draggedIndex === null ||
      draggedIndex === index ||
      disabled
    ) {
      return;
    }

    handleMove(
      draggedIndex,
      index
    );

    setDraggedIndex(index);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div
      className="space-y-4"
      id={`${idPrefix}-image-uploader`}
    >
      {/* Crop modal */}
      {isCropOpen &&
        currentCropFile && (
          <ImageCropModal
            file={currentCropFile}
            onCancel={finishCropQueue}
            onConfirm={handleCropConfirm}
          />
        )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/heic,image/heif,image/avif"
        multiple={!singleMode}
        className="hidden"
        id={`${idPrefix}-photo-file-input`}
        onChange={(e) =>
          handleFiles(e.target.files)
        }
        disabled={disabled}
      />

      {/* Error Banner */}
      {errorMessage && (
        <div
          id={`${idPrefix}-upload-error-banner`}
          className="flex items-start gap-2.5 p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 text-xs sm:text-sm leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />

          <div className="flex-1 font-medium">
            {errorMessage}
          </div>

          <button
            type="button"
            onClick={() =>
              setErrorMessage(null)
            }
            className="text-xs font-semibold text-rose-300 hover:text-white underline ml-2 shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Continue in Part 2 */}
      {/* ------------------------------------------------------------------ */}
      {/* SINGLE MODE                                                        */}
      {/* ------------------------------------------------------------------ */}

      {singleMode ? (
        <div className="space-y-3">
          {/* Label */}
          {(label || subtitle) && (
            <div>
              {label && (
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#DFBF99]" />

                  <h4 className="text-sm font-medium text-[#FAF7F2]">
                    {label}
                  </h4>
                </div>
              )}

              {subtitle && (
                <p className="text-[11px] text-[#8F7D8A] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Empty upload area */}
          {photos.length === 0 ? (
            <div
              id={`${idPrefix}-single-dropzone`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => {
                if (!disabled) {
                  fileInputRef.current?.click();
                }
              }}
              className={`
                relative
                flex
                min-h-[220px]
                w-full
                cursor-pointer
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border
                border-dashed
                transition-all
                duration-200
                ${
                  isDragging
                    ? 'border-[#DFBF99] bg-[#3A102F]/60 scale-[1.01]'
                    : 'border-[#DFBF99]/25 bg-[#18061B]/60 hover:border-[#DFBF99]/50 hover:bg-[#210920]'
                }
                ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }
              `}
            >
              <div className="flex flex-col items-center text-center px-5">
                <div className="w-14 h-14 rounded-2xl bg-[#2A0C30] border border-[#DFBF99]/20 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-[#DFBF99]" />
                </div>

                <p className="text-sm font-medium text-[#FAF7F2]">
                  {isDragging
                    ? 'Drop your photo here'
                    : 'Choose a photo'}
                </p>

                <p className="text-[11px] text-[#8F7D8A] mt-1.5">
                  Click or drag & drop
                </p>

                <p className="text-[10px] text-[#6F606B] mt-2">
                  You will be able to crop and adjust it
                  before saving.
                </p>
              </div>
            </div>
          ) : (
            /* Single preview */
            <div className="relative overflow-hidden rounded-2xl border border-[#DFBF99]/20 bg-[#0D030F]">
              <div className="aspect-video sm:aspect-[4/3] w-full">
                <img
                  src={photos[0].previewUrl}
                  alt="Selected memory"
                  className="w-full h-full object-cover"
                />

                {/* Dark gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
              </div>

              {/* Status */}
              <div className="absolute left-3 top-3">
                {photos[0].status === 'uploading' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </div>
                )}

                {photos[0].status === 'success' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-400/20 text-emerald-200 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    Uploaded
                  </div>
                )}

                {photos[0].status === 'error' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/80 backdrop-blur-md border border-rose-400/20 text-rose-200 text-[10px]">
                    <AlertCircle className="w-3 h-3" />
                    Upload failed
                  </div>
                )}
              </div>

              {/* Bottom actions */}
              <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate max-w-[180px] sm:max-w-[280px]">
                    {photos[0].file?.name || 'Photo'}
                  </p>

                  {photos[0].file?.size && (
                    <p className="text-[9px] text-white/60 mt-0.5">
                      {(
                        photos[0].file.size /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      MB
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Replace */}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) {
                        fileInputRef.current?.click();
                      }
                    }}
                    className="h-9 px-3 rounded-xl bg-black/65 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium hover:bg-black/80 transition disabled:opacity-40"
                  >
                    Replace
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleRemove(0)}
                    className="w-9 h-9 rounded-xl bg-rose-950/70 backdrop-blur-md border border-rose-300/20 text-rose-200 flex items-center justify-center hover:bg-rose-900/80 transition disabled:opacity-40"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ---------------------------------------------------------------- */
        /* MULTI MODE                                                       */
        /* ---------------------------------------------------------------- */

        <div className="space-y-4">
          {/* Label */}
          {(label || subtitle) && (
            <div>
              {label && (
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#DFBF99]" />

                  <h4 className="text-sm font-medium text-[#FAF7F2]">
                    {label}
                  </h4>
                </div>
              )}

              {subtitle && (
                <p className="text-[11px] text-[#8F7D8A] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Multi upload dropzone */}
          <div
            id={`${idPrefix}-multi-dropzone`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => {
              if (!disabled) {
                fileInputRef.current?.click();
              }
            }}
            className={`
              relative
              flex
              min-h-[170px]
              w-full
              cursor-pointer
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              border
              border-dashed
              transition-all
              duration-200
              ${
                isDragging
                  ? 'border-[#DFBF99] bg-[#3A102F]/60 scale-[1.01]'
                  : 'border-[#DFBF99]/25 bg-[#18061B]/60 hover:border-[#DFBF99]/50 hover:bg-[#210920]'
              }
              ${
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }
            `}
          >
            <div className="flex flex-col items-center text-center px-5">
              <div className="w-12 h-12 rounded-xl bg-[#2A0C30] border border-[#DFBF99]/20 flex items-center justify-center mb-3">
                <Plus className="w-5 h-5 text-[#DFBF99]" />
              </div>

              <p className="text-sm font-medium text-[#FAF7F2]">
                {isDragging
                  ? 'Drop photos here'
                  : 'Add photos'}
              </p>

              <p className="text-[11px] text-[#8F7D8A] mt-1">
                Select one or multiple photos
              </p>

              <p className="text-[10px] text-[#6F606B] mt-2">
                Each photo can be cropped before it is added.
              </p>
            </div>
          </div>

          {/* Selected photos */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#FAF7F2]">
                    Selected Photos
                  </p>

                  <p className="text-[10px] text-[#766773] mt-0.5">
                    {photos.length}{' '}
                    {photos.length === 1
                      ? 'photo'
                      : 'photos'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DFBF99]/20 bg-[#1C071F] text-[#DFBF99] text-[10px] font-medium hover:bg-[#2A0C30] transition disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" />
                  Add More
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    draggable={!disabled}
                    onDragStart={(e) =>
                      handleItemDragStart(e, index)
                    }
                    onDragOver={(e) =>
                      handleItemDragOver(e, index)
                    }
                    onDragEnd={handleItemDragEnd}
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-xl
                      border
                      bg-[#100411]
                      transition-all
                      ${
                        draggedIndex === index
                          ? 'border-[#DFBF99] opacity-50 scale-[0.98]'
                          : 'border-[#DFBF99]/15'
                      }
                    `}
                  >
                    {/* Image */}
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={photo.previewUrl}
                        alt={
                          photo.file?.name ||
                          `Photo ${index + 1}`
                        }
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

                    {/* Cover badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-[#6B183B]/90 border border-[#DFBF99]/30 text-[#FAF7F2] text-[8px] font-semibold uppercase tracking-wider">
                        <Star className="w-2.5 h-2.5 fill-[#DFBF99] text-[#DFBF99]" />
                        Cover
                      </div>
                    )}

                    {/* Upload status */}
                    <div className="absolute top-2 right-2">
                      {photo.status === 'uploading' && (
                        <div className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center">
                          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        </div>
                      )}

                      {photo.status === 'success' && (
                        <div className="w-7 h-7 rounded-full bg-emerald-950/80 backdrop-blur-md flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        </div>
                      )}

                      {photo.status === 'error' && (
                        <div className="w-7 h-7 rounded-full bg-rose-950/80 backdrop-blur-md flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
                        </div>
                      )}
                    </div>

                    {/* Hover controls */}
                    <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        {/* Move left */}
                        <button
                          type="button"
                          disabled={
                            disabled || index === 0
                          }
                          onClick={() =>
                            handleMove(
                              index,
                              index - 1
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-black/65 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/85 transition disabled:opacity-30"
                          aria-label="Move photo left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Move right */}
                        <button
                          type="button"
                          disabled={
                            disabled ||
                            index ===
                              photos.length - 1
                          }
                          onClick={() =>
                            handleMove(
                              index,
                              index + 1
                            )
                          }
                          className="w-7 h-7 rounded-lg bg-black/65 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/85 transition disabled:opacity-30"
                          aria-label="Move photo right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Set cover */}
                        {index !== 0 && (
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              handleSetCover(index)
                            }
                            className="w-7 h-7 rounded-lg bg-black/65 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/85 transition disabled:opacity-30"
                            aria-label="Set as cover"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Remove */}
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            handleRemove(index)
                          }
                          className="w-7 h-7 rounded-lg bg-rose-950/75 backdrop-blur-md border border-rose-300/20 text-rose-200 flex items-center justify-center hover:bg-rose-900/90 transition disabled:opacity-30"
                          aria-label="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* File name */}
                    {photo.file?.name && (
                      <div className="absolute left-2 right-2 bottom-[42px] pointer-events-none">
                        <p className="text-[8px] text-white/70 truncate">
                          {photo.file.name}
                        </p>
                      </div>
                    )}

                    {/* Error message */}
                    {photo.status === 'error' && (
                      <div className="absolute inset-0 bg-rose-950/45 flex items-center justify-center pointer-events-none">
                        <div className="px-3 text-center">
                          <AlertCircle className="w-5 h-5 text-rose-300 mx-auto mb-1" />

                          <p className="text-[9px] text-rose-100">
                            Upload failed
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Drag/reorder hint */}
              {photos.length > 1 && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Move className="w-3 h-3 text-[#6F606B]" />

                  <p className="text-[9px] text-[#6F606B]">
                    Drag photos to reorder • First photo is the cover
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* ------------------------------------------------------------------ */}
      {/* UPLOAD / CROP INFORMATION                                          */}
      {/* ------------------------------------------------------------------ */}

      {photos.length > 0 && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#160519]/70 border border-[#DFBF99]/10">
          <Crop className="w-3.5 h-3.5 text-[#DFBF99] shrink-0" />

          <p className="text-[10px] leading-relaxed text-[#8F7D8A]">
            Photos are cropped before upload, so you can choose the
            important part yourself instead of relying on automatic
            center cropping.
          </p>
        </div>
      )}

      {/* Upload progress */}
      {photos.some(
        (photo) => photo.status === 'uploading'
      ) && (
        <div className="space-y-2">
          {photos
            .filter(
              (photo) =>
                photo.status === 'uploading'
            )
            .map((photo) => (
              <div
                key={`progress-${photo.id}`}
                className="rounded-xl border border-[#DFBF99]/10 bg-[#160519]/70 p-3"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Loader2 className="w-3.5 h-3.5 text-[#DFBF99] animate-spin shrink-0" />

                    <span className="text-[10px] text-[#C9B7C3] truncate">
                      {photo.file?.name ||
                        'Uploading photo...'}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#DFBF99] shrink-0">
                    {Math.round(
                      photo.progress || 0
                    )}
                    %
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7D2146] to-[#DFBF99] transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          photo.progress || 0
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Empty multi state helper */}
      {!singleMode &&
        photos.length === 0 && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <ImageIcon className="w-3.5 h-3.5 text-[#6F606B]" />

            <p className="text-[9px] text-[#6F606B]">
              You can select multiple photos at once.
              Each one will open in the crop editor.
            </p>
          </div>
        )}

      {/* Crop queue indicator */}
      {isCropOpen &&
        cropQueue.length > 1 && (
          <div className="fixed bottom-5 left-1/2 z-[10000] -translate-x-1/2 pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-[#DFBF99]/20 shadow-xl">
              <p className="text-[10px] text-[#FAF7F2]">
                Photo {cropIndex + 1} of{' '}
                {cropQueue.length}
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default MemoryImageUploader;
      
                                              
