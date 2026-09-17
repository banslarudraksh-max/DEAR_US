import React, { useState } from 'react';
import { PlaceMemory, Memory } from '../../types';
import { PlaceModal } from './PlaceModal';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Plus, 
  Compass, 
  CheckCircle2, 
  ExternalLink, 
  Edit3, 
  Trash2,
  Globe
} from 'lucide-react';

interface PlacesSectionProps {
  places: PlaceMemory[];
  memories: Memory[];
  onSavePlace: (place: PlaceMemory) => void;
  onDeletePlace: (id: string) => void;
  onViewMemory: (memory: Memory) => void;
}

export const PlacesSection: React.FC<PlacesSectionProps> = ({
  places = [],
  memories = [],
  onSavePlace,
  onDeletePlace,
  onViewMemory,
}) => {
  const safePlaces = places || [];
  const safeMemories = memories || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceMemory | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(safePlaces[0]?.id || null);
  const [filter, setFilter] = useState<'all' | 'visited' | 'dream'>('all');

  const selectedPlace = safePlaces.find((p) => p.id === selectedPlaceId) || safePlaces[0];

  const filteredPlaces = safePlaces.filter((p) => {
    if (filter === 'visited') return p.isVisited;
    if (filter === 'dream') return !p.isVisited;
    return true;
  });

  // Calculate coordinates to percentage on visual world canvas projection
  // Lat: -90 to 90 -> Y: 100% to 0% (Equator ~ 50%)
  // Lon: -180 to 180 -> X: 0% to 100% (Greenwich ~ 50%)
  const getCoordinatesPercent = (lat: number, lon: number) => {
    const x = Math.max(5, Math.min(95, ((lon + 180) / 360) * 100));
    // Mercator-like compression
    const clampedLat = Math.max(-75, Math.min(75, lat));
    const y = Math.max(10, Math.min(90, ((75 - clampedLat) / 150) * 100));
    return { x, y };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-[#DFBF99]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/25 bg-[#250E28]/80 px-3.5 py-1 text-xs text-[#DFBF99] mb-2.5">
            <Globe className="h-3.5 w-3.5" />
            <span className="font-sans font-medium tracking-wide">Atlas of Our Journey</span>
          </div>
          <h1 className="editorial-title text-4xl sm:text-5xl font-normal text-[#FAF7F2]">
            Places & Memory Map
          </h1>
          <p className="text-sm text-[#C9B7C3] mt-2 max-w-lg leading-relaxed font-sans">
            Every street corner, coastline, and city that holds a piece of our story.
          </p>
        </div>

        <button
          id="add-place-btn"
          onClick={() => {
            setEditingPlace(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2.5 text-xs font-sans font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Pin a Place</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 font-sans">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            filter === 'all'
              ? 'border border-[#DFBF99]/50 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
              : 'border border-[#DFBF99]/20 bg-[#250E28]/70 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
          }`}
        >
          All Locations ({safePlaces.length})
        </button>
        <button
          onClick={() => setFilter('visited')}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            filter === 'visited'
              ? 'border border-[#DFBF99]/50 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
              : 'border border-[#DFBF99]/20 bg-[#250E28]/70 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
          }`}
        >
          Visited ({safePlaces.filter((p) => p.isVisited).length})
        </button>
        <button
          onClick={() => setFilter('dream')}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            filter === 'dream'
              ? 'border border-[#DFBF99]/50 bg-[#7D2146] text-[#FAF7F2] shadow-sm'
              : 'border border-[#DFBF99]/20 bg-[#250E28]/70 text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40'
          }`}
        >
          Dream Destinations ({safePlaces.filter((p) => !p.isVisited).length})
        </button>
      </div>

      {/* Interactive Stylized Memory Map Canvas */}
      <div className="relative mb-10 overflow-hidden rounded-2xl border border-[#DFBF99]/25 bg-[#140816] p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between text-xs text-[#C9B7C3] mb-3 font-sans">
          <div className="flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-[#DFBF99]" />
            <span>Interactive World Coordinate Map</span>
          </div>
          <span className="text-[#A896A4]">Click any pin to inspect memories</span>
        </div>

        {/* Map Canvas with subtle grid & continent outlines */}
        <div className="relative h-64 sm:h-96 w-full rounded-xl border border-[#DFBF99]/20 bg-radial from-[#240E2A] via-[#160818] to-[#0E0510] overflow-hidden">
          {/* Subtle map coordinate grid lines */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #DFBF99 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Continents abstract stylized SVG silhouette */}
          <svg
            className="absolute inset-0 h-full w-full opacity-15 pointer-events-none"
            viewBox="0 0 1000 500"
            fill="#DFBF99"
          >
            {/* North America */}
            <path d="M120,80 Q200,60 280,120 Q260,180 200,220 Q150,170 120,80 Z" />
            {/* South America */}
            <path d="M230,240 Q290,260 270,360 Q240,430 220,380 Q210,300 230,240 Z" />
            {/* Europe */}
            <path d="M460,80 Q520,70 540,130 Q490,160 450,130 Q440,90 460,80 Z" />
            {/* Africa */}
            <path d="M460,180 Q550,170 550,280 Q500,370 470,300 Q440,240 460,180 Z" />
            {/* Asia */}
            <path d="M570,80 Q750,70 820,160 Q760,260 620,220 Q560,160 570,80 Z" />
            {/* Australia */}
            <path d="M750,310 Q830,300 840,370 Q770,410 740,360 Z" />
          </svg>

          {/* Location Pins */}
          {places.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            const { x, y } = getCoordinatesPercent(place.latitude, place.longitude);

            return (
              <button
                key={place.id}
                id={`map-pin-${place.id}`}
                onClick={() => setSelectedPlaceId(place.id)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-all ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                }`}
                title={place.name}
              >
                {/* Glowing Pulse */}
                <div
                  className={`absolute -inset-2 rounded-full transition ${
                    isSelected ? 'bg-[#DFBF99]/40 animate-ping' : 'bg-transparent group-hover:bg-[#DFBF99]/20'
                  }`}
                />
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border shadow-md transition ${
                    isSelected
                      ? 'border-[#FAF7F2] bg-[#7D2146] text-[#FAF7F2] shadow-lg ring-2 ring-[#DFBF99]'
                      : place.isVisited
                      ? 'border-[#DFBF99]/50 bg-[#2F1133] text-[#DFBF99]'
                      : 'border-[#DFBF99]/30 bg-[#250E28] text-[#C9B7C3]'
                  }`}
                >
                  <MapPin className="h-3 w-3" />
                </div>

                {/* Floating Tooltip Label */}
                <div
                  className={`absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-sans font-medium backdrop-blur-md transition ${
                    isSelected
                      ? 'bg-[#7D2146] border border-[#DFBF99]/40 text-[#FAF7F2] opacity-100 shadow-md'
                      : 'bg-[#190A1C]/90 border border-white/10 text-[#C9B7C3] opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {place.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Place Detail Spotlight & Place Cards Grid */}
      {selectedPlace && (
        <div className="mb-10 rounded-2xl border border-[#DFBF99]/25 bg-gradient-to-br from-[#240E2A]/90 via-[#1B0B1E]/90 to-[#140817]/90 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="h-56 lg:h-auto lg:w-96 shrink-0 overflow-hidden rounded-xl bg-[#280E2A] border border-white/10">
              <img
                src={selectedPlace.coverImage}
                alt={selectedPlace.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-sans">
                    <span className="rounded-full bg-[#2F1133] border border-[#DFBF99]/20 px-3 py-0.5 text-[10px] font-medium text-[#DFBF99] tracking-wider uppercase">
                      {selectedPlace.isVisited ? 'Visited Together' : 'Future Dream'}
                    </span>
                    <span className="text-xs text-[#A896A4]">
                      {new Date(selectedPlace.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPlace(selectedPlace);
                        setModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-[#DFBF99] hover:bg-[#2F1133] hover:text-[#FAF7F2] transition"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeletePlace(selectedPlace.id)}
                      className="rounded-lg p-1.5 text-[#DFBF99]/60 hover:bg-[#2F1133] hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif text-3xl font-normal text-[#FAF7F2] mb-1">
                  {selectedPlace.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#DFBF99] mb-4 font-sans">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{selectedPlace.location}</span>
                  <span className="text-[#A896A4]/70">({selectedPlace.latitude.toFixed(4)}, {selectedPlace.longitude.toFixed(4)})</span>
                </div>

                <p className="text-xs sm:text-sm text-[#C9B7C3] leading-relaxed mb-4 font-sans">
                  {selectedPlace.notes || 'No specific notes recorded for this location yet.'}
                </p>
              </div>

              {/* Related Memories Link */}
              {selectedPlace.relatedMemoryIds && selectedPlace.relatedMemoryIds.length > 0 && (
                <div className="border-t border-[#DFBF99]/15 pt-3">
                  <span className="text-xs text-[#FAF7F2] font-medium block mb-2 font-sans">Connected Memories</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlace.relatedMemoryIds.map((memId) => {
                      const m = memories.find((item) => item.id === memId);
                      if (!m) return null;
                      return (
                        <button
                          key={memId}
                          onClick={() => onViewMemory(m)}
                          className="flex items-center gap-1.5 rounded-lg border border-[#DFBF99]/20 bg-[#250E28]/60 px-3 py-1.5 text-xs text-[#DFBF99] hover:bg-[#2F1133] transition font-sans"
                        >
                          <span>{m.title}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Places */}
      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            return (
              <div
                key={place.id}
                onClick={() => setSelectedPlaceId(place.id)}
                className={`group cursor-pointer overflow-hidden rounded-2xl border p-3 shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 ${
                  isSelected
                    ? 'border-[#DFBF99] bg-[#240E2A] ring-1 ring-[#DFBF99]/40'
                    : 'border-[#DFBF99]/18 bg-[#1A0B1D]/80 hover:border-[#DFBF99]/40 hover:bg-[#240E2A]'
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#280E2A] border border-white/10">
                  <img
                    src={place.coverImage}
                    alt={place.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 font-sans">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-md ${
                        place.isVisited ? 'bg-black/75 text-[#DFBF99] border border-[#DFBF99]/30' : 'bg-black/75 text-[#C9B7C3] border border-white/10'
                      }`}
                    >
                      {place.isVisited ? 'Visited' : 'Dream Destination'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 px-1">
                  <div className="flex items-center justify-between text-[11px] text-[#A896A4] mb-1 font-sans">
                    <span>{place.location}</span>
                    <span>{new Date(place.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h4 className="font-serif text-xl font-normal text-[#FAF7F2] truncate group-hover:text-[#EADFD5] transition">
                    {place.name}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs text-[#C9B7C3] leading-relaxed font-normal">
                    {place.notes}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DFBF99]/30 bg-[#1B0B1E]/60 p-12 text-center backdrop-blur-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#7D2146]/40 border border-[#DFBF99]/30 text-[#DFBF99]">
            <MapPin className="h-5 w-5" />
          </div>
          <h4 className="font-serif text-2xl font-normal text-[#FAF7F2] mb-1">No places found in this view.</h4>
          <p className="text-xs text-[#C9B7C3] max-w-sm mx-auto mb-5">
            Pin the scenic overlooks, cozy bookshops, and sunset coasts where you&apos;ve walked hand-in-hand.
          </p>
          <button
            onClick={() => {
              setEditingPlace(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/40 bg-[#7D2146] px-5 py-2 text-xs font-sans font-medium text-[#FAF7F2] hover:bg-[#8B264E] transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Pin a Destination</span>
          </button>
        </div>
      )}

      <PlaceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSavePlace}
        initialPlace={editingPlace}
      />
    </div>
  );
};
