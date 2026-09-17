import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlaceMemory } from '../../types';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  Compass, 
  Calendar, 
  Image as ImageIcon, 
  AlertTriangle, 
  X,
  ExternalLink
} from 'lucide-react';

interface AdminPlacesProps {
  places: PlaceMemory[];
  onSavePlace: (place: PlaceMemory) => Promise<void>;
  onDeletePlace: (id: string) => Promise<void>;
  currentUser: string;
}

export const AdminPlaces: React.FC<AdminPlacesProps> = ({
  places,
  onSavePlace,
  onDeletePlace,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisited, setFilterVisited] = useState<'all' | 'visited' | 'dream'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Partial<PlaceMemory> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredPlaces = places.filter((p) => {
    const q = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = !q || (
      Boolean(p.name && p.name.toLowerCase().includes(q)) ||
      Boolean(p.country && p.country.toLowerCase().includes(q)) ||
      Boolean(p.notes && p.notes.toLowerCase().includes(q))
    );
    const matchesVisited = 
      filterVisited === 'all' || 
      (filterVisited === 'visited' && p.isVisited) ||
      (filterVisited === 'dream' && !p.isVisited);
    return matchesSearch && matchesVisited;
  });

  const handleOpenAdd = () => {
    setEditingPlace({
      id: `place-${Date.now()}`,
      userId: 'partner-1',
      name: '',
      country: '',
      latitude: 48.8566,
      longitude: 2.3522,
      isVisited: true,
      visitDate: new Date().toISOString().split('T')[0],
      notes: '',
      photos: [],
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (place: PlaceMemory) => {
    setEditingPlace({ ...place });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace || !editingPlace.name || !editingPlace.country) return;

    const finalPlace: PlaceMemory = {
      id: editingPlace.id || `place-${Date.now()}`,
      userId: editingPlace.userId || 'partner-1',
      name: editingPlace.name,
      location: editingPlace.location || editingPlace.name,
      country: editingPlace.country,
      latitude: Number(editingPlace.latitude) || 0,
      longitude: Number(editingPlace.longitude) || 0,
      date: editingPlace.date || editingPlace.visitDate || new Date().toISOString().split('T')[0],
      visitDate: editingPlace.visitDate,
      coverImage: editingPlace.coverImage || editingPlace.photos?.[0] || '',
      notes: editingPlace.notes || '',
      photos: editingPlace.photos || [],
      relatedMemoryIds: editingPlace.relatedMemoryIds || [],
      isVisited: Boolean(editingPlace.isVisited),
      createdAt: editingPlace.createdAt || new Date().toISOString(),
    };

    await onSavePlace(finalPlace);
    setIsModalOpen(false);
    setEditingPlace(null);
  };

  return (
    <div className="space-y-6">
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
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg shrink-0"
        >
          <Plus className="h-4 w-4 text-[#DFBF99]" />
          <span>Pin New Place</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-[#DFBF99]/20 bg-[#18081B]/80 p-3 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DFBF99]/70" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search places by city, country, or notes..."
            className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 pl-10 pr-4 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
          />
        </div>

        <div className="inline-flex rounded-xl border border-[#DFBF99]/20 bg-[#120514] p-0.5 text-xs">
          <button
            onClick={() => setFilterVisited('all')}
            className={`rounded-lg px-3 py-1.5 transition ${filterVisited === 'all' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A]'}`}
          >
            All ({places.length})
          </button>
          <button
            onClick={() => setFilterVisited('visited')}
            className={`rounded-lg px-3 py-1.5 transition ${filterVisited === 'visited' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A]'}`}
          >
            Visited ({places.filter(p => p.isVisited).length})
          </button>
          <button
            onClick={() => setFilterVisited('dream')}
            className={`rounded-lg px-3 py-1.5 transition ${filterVisited === 'dream' ? 'bg-[#351239] text-[#FAF7F2]' : 'text-[#8F7D8A]'}`}
          >
            Wishlist ({places.filter(p => !p.isVisited).length})
          </button>
        </div>
      </div>

      {/* Places Table */}
      <div className="overflow-hidden rounded-xl border border-[#DFBF99]/20 bg-[#150617]/90 backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#FAF7F2]">
            <thead className="border-b border-[#DFBF99]/15 bg-[#200A23]/80 text-[#DFBF99] font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Place Name</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4">Coordinates (Lat, Lng)</th>
                <th className="py-3.5 px-4">Date Visited</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFBF99]/10">
              {filteredPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-[#200A24]/60 transition">
                  <td className="py-3 px-4 font-medium text-[#FAF7F2] max-w-[200px]">
                    <div className="flex items-center gap-2.5">
                      {place.photos && place.photos[0] ? (
                        <img
                          src={place.photos[0]}
                          alt={place.name}
                          className="h-9 w-9 rounded-lg object-cover border border-[#DFBF99]/20 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFBF99]/15 bg-[#250E28] text-[#DFBF99] shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                      )}
                      <div className="truncate">
                        <div className="truncate font-medium">{place.name}</div>
                        <div className="text-[10px] text-[#8F7D8A] truncate max-w-[160px]">
                          {place.notes}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#C9B7C3] whitespace-nowrap">
                    {place.country}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#DFBF99] whitespace-nowrap">
                    {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#C9B7C3] whitespace-nowrap">
                    {place.visitDate || '&mdash;'}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {place.isVisited ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-700/40">
                        <CheckCircle2 className="h-3 w-3" /> Visited
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-950/60 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-700/40">
                        <Compass className="h-3 w-3" /> Dream Spot
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(place)}
                        title="Edit Place"
                        className="rounded-lg p-1.5 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#341238] transition"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(place.id)}
                        title="Delete Place"
                        className="rounded-lg p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {isModalOpen && editingPlace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-2xl border border-[#DFBF99]/30 bg-[#19081B] p-6 sm:p-8 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#DFBF99]/15 pb-4 mb-6">
                <h3 className="editorial-title text-2xl text-[#FAF7F2] font-normal">
                  {editingPlace.name ? 'Edit Location' : 'Pin New Place'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-[#8F7D8A] hover:text-[#FAF7F2]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Place / City Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPlace.name || ''}
                      onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
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
                      value={editingPlace.country || ''}
                      onChange={(e) => setEditingPlace({ ...editingPlace, country: e.target.value })}
                      placeholder="e.g. Italy"
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editingPlace.latitude ?? ''}
                      onChange={(e) => setEditingPlace({ ...editingPlace, latitude: parseFloat(e.target.value) })}
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
                      value={editingPlace.longitude ?? ''}
                      onChange={(e) => setEditingPlace({ ...editingPlace, longitude: parseFloat(e.target.value) })}
                      placeholder="11.2558"
                      className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Visit Date (Optional if Dream Destination)
                  </label>
                  <input
                    type="date"
                    value={editingPlace.visitDate || ''}
                    onChange={(e) => setEditingPlace({ ...editingPlace, visitDate: e.target.value })}
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] py-2 px-3 text-xs text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#EADFD5] mb-1.5">
                    Travel Memories &amp; Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editingPlace.notes || ''}
                    onChange={(e) => setEditingPlace({ ...editingPlace, notes: e.target.value })}
                    placeholder="Gelato spots, sunset viewpoints, memorable moments..."
                    className="w-full rounded-xl border border-[#DFBF99]/25 bg-[#120514] p-3 text-xs text-[#FAF7F2] placeholder-[#8A7584] focus:border-[#DFBF99] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FAF7F2]">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPlace.isVisited)}
                      onChange={(e) => setEditingPlace({ ...editingPlace, isVisited: e.target.checked })}
                      className="rounded border-[#DFBF99]/40 bg-[#120514] text-[#7D2146] focus:ring-0"
                    />
                    <span>Marked as Visited (Uncheck for future Dream Trip)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFBF99]/15">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-[#DFBF99]/20 bg-[#250D29] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#34133A] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-[#DFBF99]/40 bg-gradient-to-r from-[#7D2146] to-[#5C1632] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] hover:brightness-110 active:scale-95 transition shadow-lg"
                  >
                    Save Place
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
                  onClick={() => setDeleteConfirmId(null)}
                  className="rounded-xl border border-[#DFBF99]/20 bg-[#280E2B] px-5 py-2.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#38143C] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onDeletePlace(deleteConfirmId);
                    setDeleteConfirmId(null);
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
