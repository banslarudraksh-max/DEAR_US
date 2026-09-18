import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlaceMemory } from '../../types';
import { vaultStorage } from '../../services/vaultStorage';
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Compass,
  X,
  Upload,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Move,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface AdminPlacesProps {
  places: PlaceMemory[];
  onSavePlace: (place: PlaceMemory) => Promise<void>;
  onDeletePlace: (id: string) => Promise<void>;
  currentUser: string;
}

/* =========================================================
   IMAGE CROP MODAL
   ========================================================= */

interface PlaceImageCropModalProps {
  file: File;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const PlaceImageCropModal: React.FC<PlaceImageCropModalProps> = ({
  file,
  onCancel,
  onConfirm,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);

  const [imageUrl, setImageUrl] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
    positionX: 0,
    positionY: 0,
  });

  const CROP_WIDTH = 360;
  const CROP_HEIGHT = 270;

  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 3;

  /* -------------------------------------------------------
     Create temporary preview URL
     ------------------------------------------------------- */

  useEffect(() => {
    const url = URL.createObjectURL(file);

    setImageUrl(url);
    setImageLoaded(false);
    setZoom(1);
    setPosition({
      x: 0,
      y: 0,
    });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  /* -------------------------------------------------------
     Image loaded
     ------------------------------------------------------- */

  const handleImageLoad = () => {
    setImageLoaded(true);
    setZoom(1);
    setPosition({
      x: 0,
      y: 0,
    });
  };

  /* -------------------------------------------------------
     Drag
     ------------------------------------------------------- */

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
    } catch {}
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
      x:
        dragStartRef.current.positionX +
        deltaX,

      y:
        dragStartRef.current.positionY +
        deltaY,
    });
  };

  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    } catch {}
  };

  /* -------------------------------------------------------
     Zoom
     ------------------------------------------------------- */

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

    setPosition({
      x: 0,
      y: 0,
    });
  };

  /* -------------------------------------------------------
     Create cropped image
     ------------------------------------------------------- */

  const createCroppedImage = async () => {
    if (!imageRef.current || !imageLoaded) {
      return;
    }

    const image = imageRef.current;

    const naturalWidth =
      image.naturalWidth;

    const naturalHeight =
      image.naturalHeight;

    if (!naturalWidth || !naturalHeight) {
      return;
    }

    /*
      Base scale makes sure the image completely
      covers the crop area.
    */

    const baseScale = Math.max(
      CROP_WIDTH / naturalWidth,
      CROP_HEIGHT / naturalHeight
    );

    const finalScale =
      baseScale * zoom;

    const displayedWidth =
      naturalWidth * finalScale;

    const displayedHeight =
      naturalHeight * finalScale;

    const imageLeft =
      (CROP_WIDTH - displayedWidth) / 2 +
      position.x;

    const imageTop =
      (CROP_HEIGHT - displayedHeight) / 2 +
      position.y;

    const sourceX =
      (0 - imageLeft) / finalScale;

    const sourceY =
      (0 - imageTop) / finalScale;

    const sourceWidth =
      CROP_WIDTH / finalScale;

    const sourceHeight =
      CROP_HEIGHT / finalScale;

    /*
      Keep source coordinates inside image bounds.
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
      High-quality output.
      4:3 ratio.
    */

    const OUTPUT_WIDTH = 1200;
    const OUTPUT_HEIGHT = 900;

    const canvas =
      document.createElement('canvas');

    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const context =
      canvas.getContext('2d');

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

    const blob =
      await new Promise<Blob | null>(
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

    onConfirm(croppedFile);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Adjust place photo"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
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
                Adjust Place Photo
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

        {/* Crop area */}
        <div className="px-4 pt-5">
          <div className="flex justify-center">
            <div
              className="relative overflow-hidden rounded-2xl bg-[#080208] border border-[#DFBF99]/25 shadow-inner select-none touch-none"
              style={{
                width: CROP_WIDTH,
                height: CROP_HEIGHT,
                maxWidth:
                  'calc(100vw - 40px)',
                maxHeight:
                  'calc(100vw - 70px)',
              }}
              onPointerDown={
                handlePointerDown
              }
              onPointerMove={
                handlePointerMove
              }
              onPointerUp={
                handlePointerUp
              }
              onPointerCancel={
                handlePointerUp
              }
            >
              {/* Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#321238_0%,#0A020B_70%)]" />

              {/* Image */}
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Place photo being cropped"
                  onLoad={handleImageLoad}
                  draggable={false}
                  className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
                  style={{
                    width: 'auto',
                    height: 'auto',
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

              {/* Crop overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Dark outside effect */}
                <div className="absolute inset-0 ring-[999px] ring-black/45" />

                {/* Inner border */}
                <div className="absolute inset-3 border border-white/30 rounded-lg" />

                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-7 h-7 border-l-2 border-t-2 border-[#DFBF99]" />

                <div className="absolute top-3 right-3 w-7 h-7 border-r-2 border-t-2 border-[#DFBF99]" />

                <div className="absolute bottom-3 left-3 w-7 h-7 border-l-2 border-b-2 border-[#DFBF99]" />

                <div className="absolute bottom-3 right-3 w-7 h-7 border-r-2 border-b-2 border-[#DFBF99]" />

                {/* Rule of thirds */}
                <div className="absolute left-1/3 top-3 bottom-3 w-px bg-white/15" />

                <div className="absolute left-2/3 top-3 bottom-3 w-px bg-white/15" />

                <div className="absolute top-1/3 left-3 right-3 h-px bg-white/15" />

                <div className="absolute top-2/3 left-3 right-3 h-px bg-white/15" />

                {/* Center point */}
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

            <div className="min-w-[110px] text-center">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#8F7D8A]">
                Zoom
              </div>

              <div className="text-sm font-medium text-[#FAF7F2] mt-0.5">
                {Math.round(
                  zoom * 100
                )}
                %
              </div>
            </div>

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

          {/* Instructions */}
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
            onClick={
              createCroppedImage
            }
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

/* =========================================================
   ADMIN PLACES
   ========================================================= */

export const AdminPlaces: React.FC<
  AdminPlacesProps
> = ({
  places,
  onSavePlace,
  onDeletePlace,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] =
    useState('');

  const [filterVisited, setFilterVisited] =
    useState<
      'all' | 'visited' | 'dream'
    >('all');

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    editingPlace,
    setEditingPlace,
  ] =
    useState<
      Partial<PlaceMemory> | null
    >(null);

  const [
    deleteConfirmId,
    setDeleteConfirmId,
  ] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     Image states
     ------------------------------------------------------- */

  const [cropFile, setCropFile] =
    useState<File | null>(null);

  const [isCropOpen, setIsCropOpen] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  /* -------------------------------------------------------
     Search/filter
     ------------------------------------------------------- */

  const filteredPlaces =
    places.filter((p) => {
      const q =
        (searchTerm || '')
          .trim()
          .toLowerCase();

      const matchesSearch =
        !q ||
        Boolean(
          p.name &&
            p.name
              .toLowerCase()
              .includes(q)
        ) ||
        Boolean(
          p.country &&
            p.country
              .toLowerCase()
              .includes(q)
        ) ||
        Boolean(
          p.notes &&
            p.notes
              .toLowerCase()
              .includes(q)
        );

      const matchesVisited =
        filterVisited === 'all' ||
        (filterVisited ===
          'visited' &&
          p.isVisited) ||
        (filterVisited ===
          'dream' &&
          !p.isVisited);

      return (
        matchesSearch &&
        matchesVisited
      );
    });

  /* -------------------------------------------------------
     Add place
     ------------------------------------------------------- */

  const handleOpenAdd = () => {
    setEditingPlace({
      id: `place-${Date.now()}`,

      userId:
        currentUser || 'partner-1',

      name: '',

      country: '',

      latitude: 48.8566,

      longitude: 2.3522,

      isVisited: true,

      visitDate:
        new Date()
          .toISOString()
          .split('T')[0],

      notes: '',

      photos: [],

      coverImage: '',

      createdAt:
        new Date().toISOString(),
    });

    setIsModalOpen(true);
  };

  /* -------------------------------------------------------
     Edit place
     ------------------------------------------------------- */

  const handleOpenEdit = (
    place: PlaceMemory
  ) => {
    setEditingPlace({
      ...place,
    });

    setIsModalOpen(true);
  };

  /* -------------------------------------------------------
     Open image picker
     ------------------------------------------------------- */

  const handleChooseImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    /*
      Reset input so selecting the
      same image again works.
    */

    e.target.value = '';

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith('image/')
    ) {
      alert(
        'Please select an image file.'
      );

      return;
    }

    /*
      10 MB limit
    */

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        'Image must be smaller than 10 MB.'
      );

      return;
    }

    setCropFile(file);
    setIsCropOpen(true);
  };

  /* -------------------------------------------------------
     Crop confirmed
     ------------------------------------------------------- */

  const handleCropConfirm = async (
    croppedFile: File
  ) => {
    setIsCropOpen(false);
    setCropFile(null);

    setUploadingImage(true);

    try {
      /*
        Upload cropped image directly
        through existing Supabase storage service.
      */

      const url =
        await vaultStorage.uploadFile(
          croppedFile
        );

      /*
        Update place form.
      */

      setEditingPlace(
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,

            coverImage: url,

            photos: [
              url,
              ...(current.photos || []).filter(
                (photo) =>
                  photo !==
                  current.coverImage
              ),
            ],
          };
        }
      );
    } catch (error: any) {
      console.error(
        'Place image upload error:',
        error
      );

      alert(
        error?.message ||
          'Error uploading place image.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  /* -------------------------------------------------------
     Remove image
     ------------------------------------------------------- */

  const handleRemoveImage = () => {
    setEditingPlace(
      (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          coverImage: '',

          photos: [],
        };
      }
    );
  };

  /* -------------------------------------------------------
     Save place
     ------------------------------------------------------- */

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !editingPlace ||
      !editingPlace.name ||
      !editingPlace.country
    ) {
      return;
    }

    const photos =
      editingPlace.photos || [];

    const coverImage =
      editingPlace.coverImage ||
      photos[0] ||
      '';

    const finalPlace: PlaceMemory = {
      id:
        editingPlace.id ||
        `place-${Date.now()}`,

      userId:
        editingPlace.userId ||
        currentUser ||
        'partner-1',

      name:
        editingPlace.name,

      location:
        editingPlace.location ||
        editingPlace.name,

      country:
        editingPlace.country,

      latitude:
        Number(
          editingPlace.latitude
        ) || 0,

      longitude:
        Number(
          editingPlace.longitude
        ) || 0,

      date:
        editingPlace.date ||
        editingPlace.visitDate ||
        new Date()
          .toISOString()
          .split('T')[0],

      visitDate:
        editingPlace.visitDate,

      coverImage,

      notes:
        editingPlace.notes || '',

      photos,

      relatedMemoryIds:
        editingPlace.relatedMemoryIds ||
        [],

      isVisited:
        Boolean(
          editingPlace.isVisited
        ),

      createdAt:
        editingPlace.createdAt ||
        new Date().toISOString(),
    };

    await onSavePlace(
      finalPlace
    );

    setIsModalOpen(false);
    setEditingPlace(null);
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="space-y-6">
      {/* -----------------------------------------------------
          Header
      ----------------------------------------------------- */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="editorial-title text-2xl sm:text-3xl text-[#FAF7F2] font-normal">
            Atlas &amp; Places Visited
          </h2>

          <p className="text-xs text-[#C9B7C3] font-sans mt-0.5">
            Coordinate management for shared travel destinations, dream escapes, and memorable geography.
          </p>
        </div>

        <button
          onClick={
            handleOpenAdd
          }
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />

          <span>
            Pin New Place
          </span>
        </button>
      </div>

      {/*
      -----------------------------------------------------
          Search / Filter
      ----------------------------------------------------- */}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-[#DFBF99]/20 bg-[#18081B]/80 p-3 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/70" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            placeholder="Search places by city, country, or notes..."
            className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
          />
        </div>

        <div className="inline-flex rounded-xl border border-[#DFBF99]/20 bg-[#120514] p-0.5 text-xs">
          <button
            onClick={() =>
              setFilterVisited(
                'all'
              )
            }
            className={`rounded-lg px-3 py-1.5 transition ${
              filterVisited ===
              'all'
                ? 'bg-[#351239] text-[#FAF7F2]'
                : 'text-[#8F7D8A]'
            }`}
          >
            All ({places.length})
          </button>

          <button
            onClick={() =>
              setFilterVisited(
                'visited'
              )
            }
            className={`rounded-lg px-3 py-1.5 transition ${
              filterVisited ===
              'visited'
                ? 'bg-[#351239] text-[#FAF7F2]'
                : 'text-[#8F7D8A]'
            }`}
          >
            Visited (
            {
              places.filter(
                (p) =>
                  p.isVisited
              ).length
            }
            )
          </button>

          <button
            onClick={() =>
              setFilterVisited(
                'dream'
              )
            }
            className={`rounded-lg px-3 py-1.5 transition ${
              filterVisited ===
              'dream'
                ? 'bg-[#351239] text-[#FAF7F2]'
                : 'text-[#8F7D8A]'
            }`}
          >
            Wishlist (
            {
              places.filter(
                (p) =>
                  !p.isVisited
              ).length
            }
            )
          </button>
        </div>
      </div>

      {/* -----------------------------------------------------
          Places Table
      ----------------------------------------------------- */}

      <div className="overflow-hidden rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#FAF7F2]">
            <thead className="border-b border-[#DFBF99]/15 bg-[#200A23]/80 text-[#DFBF99] font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">
                  Place Name
                </th>

                <th className="py-3.5 px-4">
                  Country
                </th>

                <th className="py-3.5 px-4">
                  Coordinates (Lat, Lng)
                </th>

                <th className="py-3.5 px-4">
                  Date Visited
                </th>

                <th className="py-3.5 px-4">
                  Status
                </th>

                <th className="py-3.5 px-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#DFBF99]/10">
              {filteredPlaces.map(
                (place) => (
                  <tr
                    key={place.id}
                    className="hover:bg-[#200A24]/60 transition"
                  >
                    <td className="py-3 px-4 font-medium text-[#FAF7F2] max-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        {place.coverImage ||
                        (place.photos &&
                          place.photos[0]) ? (
                          <img
                            src={
                              place.coverImage ||
                              place.photos?.[0] ||
                              ''
                            }
                            alt={
                              place.name
                            }
                            className="h-9 w-9 rounded-lg object-cover border border-[#DFBF99]/20 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFBF99]/15 bg-[#250E28] text-[#DFBF99] shrink-0">
                            <MapPin className="h-4 w-4" />
                          </div>
                        )}

                        <div className="truncate">
                          <div className="truncate font-medium">
                            {
                              place.name
                            }
                          </div>

                          <div className="text-[10px] text-[#8F7D8A] truncate max-w-[160px]">
                            {
                              place.notes
                            }
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#C9B7C3] whitespace-nowrap">
                      {
                        place.country
                      }
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-[#DFBF99] whitespace-nowrap">
                      {Number(
                        place.latitude
                      ).toFixed(4)}
                      ,{' '}
                      {Number(
                        place.longitude
                      ).toFixed(4)}
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-[#C9B7C3] whitespace-nowrap">
                      {place.visitDate ||
                        '—'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {place.isVisited ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-700/40">
                          <CheckCircle2 className="h-3 w-3" />

                          Visited
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-indigo-950/60 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-700/40">
                          <Compass className="h-3 w-3" />

                          Dream Spot
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            handleOpenEdit(
                              place
                            )
                          }
                          title="Edit Place"
                          className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            setDeleteConfirmId(
                              place.id
                            )
                          }
                          title="Delete Place"
                          className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/*
      =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <AnimatePresence>
        {isModalOpen &&
          editingPlace && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                }}
                className="relative w-full max-w-lg my-4 rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 sm:p-8 text-left shadow-2xl"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-6">
                  <h3 className="editorial-title text-2xl text-[#FAF7F2] font-normal">
                    {editingPlace.name
                      ? 'Edit Location'
                      : 'Pin New Place'}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setIsModalOpen(
                        false
                      )
                    }
                    className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2] hover:bg-white/5 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  onSubmit={
                    handleSave
                  }
                  className="space-y-4"
                >
                  {/* ------------------------------------------------
                      Name + Country
                  ------------------------------------------------ */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                        Place / City Name *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          editingPlace.name ||
                          ''
                        }
                        onChange={(
                          e
                        ) =>
                          setEditingPlace(
                            {
                              ...editingPlace,
                              name:
                                e
                                  .target
                                  .value,
                            }
                          )
                        }
                        placeholder="e.g. Florence"
                        className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                        Country *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          editingPlace.country ||
                          ''
                        }
                        onChange={(
                          e
                        ) =>
                          setEditingPlace(
                            {
                              ...editingPlace,
                              country:
                                e
                                  .target
                                  .value,
                            }
                          )
                        }
                        placeholder="e.g. Italy"
                        className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* ------------------------------------------------
                      Coordinates
                  ------------------------------------------------ */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                        Latitude
                      </label>

                      <input
                        type="number"
                        step="any"
                        value={
                          editingPlace.latitude ??
                          ''
                        }
                        onChange={(
                          e
                        ) =>
                          setEditingPlace(
                            {
                              ...editingPlace,
                              latitude:
                                parseFloat(
                                  e
                                    .target
                                    .value
                                ),
                            }
                          )
                        }
                        placeholder="43.7696"
                        className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                        Longitude
                      </label>

                      <input
                        type="number"
                        step="any"
                        value={
                          editingPlace.longitude ??
                          ''
                        }
                        onChange={(
                          e
                        ) =>
                          setEditingPlace(
                            {
                              ...editingPlace,
                              longitude:
                                parseFloat(
                                  e
                                    .target
                                    .value
                                ),
                            }
                          )
                        }
                        placeholder="11.2558"
                        className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 
                  ------------------------------------------------
                      Visit date
                  ------------------------------------------------ */}

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Visit Date (Optional if Dream Destination)
                    </label>

                    <input
                      type="date"
                      value={
                        editingPlace.visitDate ||
                        ''
                      }
                      onChange={(
                        e
                      ) =>
                        setEditingPlace(
                          {
                            ...editingPlace,
                            visitDate:
                              e
                                .target
                                .value,
                          }
                        )
                      }
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>

                  {/* =================================================
                      COVER IMAGE UPLOAD
                  ================================================= */}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-[#EADFD5] uppercase tracking-wider">
                        Cover Photograph
                      </label>

                      {editingPlace.coverImage && (
                        <span className="text-[9px] uppercase tracking-wider text-emerald-300">
                          Image selected
                        </span>
                      )}
                    </div>

                    {/* Preview */}
                    {editingPlace.coverImage ? (
                      <div className="relative mb-3 overflow-hidden rounded-2xl border border-[#DFBF99]/30 bg-[#100410]">
                        <img
                          src={
                            editingPlace.coverImage
                          }
                          alt="Place cover"
                          className="w-full aspect-[4/3] object-cover"
                          referrerPolicy="no-referrer"
                        />

                        {/* Preview overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3 pt-10">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-white/80">
                              Cover photo
                            </span>

                            <button
                              type="button"
                              onClick={
                                handleRemoveImage
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-black/70 border border-white/10 px-2.5 py-1.5 text-[10px] text-white hover:bg-rose-950/80 hover:text-rose-200 transition"
                            >
                              <Trash2 className="h-3 w-3" />

                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-[#DFBF99]/25 bg-[#120514]">
                        <div className="text-center px-6">
                          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#250E28] border border-[#DFBF99]/15">
                            <ImageIcon className="h-5 w-5 text-[#DFBF99]" />
                          </div>

                          <p className="text-xs text-[#C9B7C3]">
                            No cover photo selected
                          </p>

                          <p className="mt-1 text-[10px] text-[#806F7B]">
                            Upload a photo of this destination
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Upload button */}
                    <label
                      className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#DFBF99]/35 bg-[#250E28]/40 px-3 py-3 text-xs text-[#C9B7C3] transition ${
                        uploadingImage
                          ? 'cursor-wait opacity-60'
                          : 'cursor-pointer hover:border-[#DFBF99]/70 hover:bg-[#250E28]/80'
                      }`}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 text-[#DFBF99] animate-spin" />

                          <span>
                            Uploading...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-[#DFBF99]" />

                          <span>
                            {editingPlace.coverImage
                              ? 'Change Cover Image'
                              : 'Upload Cover Image'}
                          </span>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={
                          handleChooseImage
                        }
                        disabled={
                          uploadingImage
                        }
                        className="hidden"
                      />
                    </label>

                    <p className="mt-1.5 text-[10px] text-[#806F7B] text-center">
                      JPG, PNG, WEBP or GIF • Max 10 MB • Crop before upload
                    </p>
                  </div>

                  {/* ------------------------------------------------
                      Notes
                  ------------------------------------------------ */}

                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Travel Memories &amp; Notes
                    </label>

                    <textarea
                      rows={3}
                      value={
                        editingPlace.notes ||
                        ''
                      }
                      onChange={(
                        e
                      ) =>
                        setEditingPlace(
                          {
                            ...editingPlace,
                            notes:
                              e
                                .target
                                .value,
                          }
                        )
                      }
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                      />

                      <span>
                        Marked as Visited (Uncheck for future Dream Trip)
                      </span>
                    </label>
                  </div>

                  {/* ------------------------------------------------
                      Footer buttons
                  ------------------------------------------------ */}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
                    <button
                      type="button"
                      onClick={() =>
                        setIsModalOpen(
                          false
                        )
                      }
                      disabled={
                        uploadingImage
                      }
                      className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A] disabled:opacity-40 transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        uploadingImage
                      }
                      className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 disabled:opacity-40 transition shadow-lg"
                    >
                      {uploadingImage
                        ? 'Uploading...'
                        : 'Save Place'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
      </AnimatePresence>

      {/* =====================================================
          CROP MODAL
      ===================================================== */}

      <AnimatePresence>
        {isCropOpen &&
          cropFile && (
            <PlaceImageCropModal
              file={cropFile}
              onCancel={() => {
                setIsCropOpen(
                  false
                );
                setCropFile(null);
              }}
              onConfirm={
                handleCropConfirm
              }
            />
          )}
      </AnimatePresence>

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#1D081F] p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-950/60 text-rose-400 border border-rose-700/40">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <h3 className="editorial-title text-xl text-[#FAF7F2] font-normal mb-2">
                Delete Place from Atlas?
              </h3>

              <p className="text-xs text-[#C9B7C3] leading-relaxed mb-6 font-sans">
                This will remove the pin and coordinates from the shared couple map.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() =>
                    setDeleteConfirmId(
                      null
                    )
                  }
                  className="rounded-xl border border-[#DFBF99]/20 bg-[#280E2B] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#38143C] transition"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    await onDeletePlace(
                      deleteConfirmId
                    );

                    setDeleteConfirmId(
                      null
                    );
                  }}
                  className="rounded-xl border border-rose-500/50 bg-rose-700 px-5 py-2.5 text-xs font-medium text-white hover:bg-rose-600 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
