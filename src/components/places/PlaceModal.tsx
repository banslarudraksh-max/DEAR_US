import React, { useState } from 'react';
import { PlaceMemory } from '../../types';
import { vaultStorage } from '../../services/vaultStorage';
import { useAuth } from '../../context/AuthContext';
import { X, Upload, MapPin, Calendar, Compass } from 'lucide-react';

interface PlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (place: PlaceMemory) => void;
  initialPlace?: PlaceMemory | null;
}

export const PlaceModal: React.FC<PlaceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlace,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState(initialPlace?.name || '');
  const [location, setLocation] = useState(initialPlace?.location || '');
  const [latitude, setLatitude] = useState(initialPlace?.latitude?.toString() || '48.8566');
  const [longitude, setLongitude] = useState(initialPlace?.longitude?.toString() || '2.3522');
  const [date, setDate] = useState(initialPlace?.date || new Date().toISOString().split('T')[0]);
  const [coverImage, setCoverImage] = useState(initialPlace?.coverImage || '');
  const [notes, setNotes] = useState(initialPlace?.notes || '');
  const [isVisited, setIsVisited] = useState(initialPlace?.isVisited ?? true);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await vaultStorage.uploadFile(file);
      setCoverImage(url);
    } catch (err: any) {
      alert(err.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      alert('Please fill out name and location');
      return;
    }

    const place: PlaceMemory = {
      id: initialPlace?.id || `place-${Date.now()}`,
      userId: user?.id || 'partner-1',
      name: name.trim(),
      location: location.trim(),
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      date,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      photos: coverImage ? [coverImage] : [],
      notes: notes.trim(),
      relatedMemoryIds: initialPlace?.relatedMemoryIds || [],
      isVisited,
      createdAt: initialPlace?.createdAt || new Date().toISOString(),
    };

    onSave(place);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#DFBF99]/30 bg-[#17091A] p-6 sm:p-8 shadow-2xl shadow-black/80">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-[#C9B7C3] hover:text-[#FAF7F2] hover:bg-[#250E28] transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="editorial-title text-2xl sm:text-3xl font-normal text-[#FAF7F2] mb-5">
          {initialPlace ? 'Edit Place' : 'Pin a Cherished Destination'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Place Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shakespeare and Company"
              required
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">City / Region</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Paris, France"
                required
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Date Visited / Planned</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="48.8566"
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="2.3522"
                className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#DFBF99] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Notes & Recollections</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What made this place special? The scent of the air, the coffee shop next door..."
              className="w-full rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/70 px-4 py-2.5 text-sm text-[#FAF7F2] placeholder-[#C9B7C3]/40 focus:border-[#DFBF99] focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-[#DFBF99]/20 bg-[#250E28]/40 p-3">
            <input
              type="checkbox"
              id="isVisited"
              checked={isVisited}
              onChange={(e) => setIsVisited(e.target.checked)}
              className="h-4 w-4 rounded border-[#DFBF99]/30 text-[#7D2146] focus:ring-[#DFBF99]"
            />
            <label htmlFor="isVisited" className="text-xs text-[#FAF7F2] font-medium cursor-pointer">
              We have visited this place (Uncheck if it's a dream future trip)
            </label>
          </div>

          {/* Cover image upload */}
          <div>
            <label className="block text-xs font-medium text-[#DFBF99] mb-1.5 uppercase tracking-wider">Cover Photograph</label>
            {coverImage && (
              <div className="relative mb-2 h-28 w-full rounded-xl overflow-hidden border border-[#DFBF99]/30">
                <img src={coverImage} alt="Cover" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white hover:text-red-400 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#DFBF99]/35 bg-[#250E28]/40 px-3 py-3 text-xs text-[#C9B7C3] cursor-pointer hover:border-[#DFBF99]/70 hover:bg-[#250E28]/80 transition">
              <Upload className="h-4 w-4 text-[#DFBF99]" />
              <span>{uploading ? 'Uploading...' : 'Upload Cover Image'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#DFBF99]/15">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#DFBF99]/20 px-5 py-2 text-xs font-medium text-[#C9B7C3] hover:text-[#FAF7F2] hover:border-[#DFBF99]/40 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full border border-[#DFBF99]/35 bg-gradient-to-r from-[#7D2146] via-[#8B264E] to-[#681938] px-6 py-2 text-xs font-medium text-[#FAF7F2] shadow-md shadow-black/40 transition hover:scale-[1.02] hover:border-[#DFBF99]/60 active:scale-95"
            >
              {initialPlace ? 'Save Changes' : 'Pin Destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
