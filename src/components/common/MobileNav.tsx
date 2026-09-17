import React from 'react';
import { ActiveTab } from '../../types';
import { Home, Compass, Image, Mail, MapPin, MoreHorizontal } from 'lucide-react';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  onNavigate?: (tab: ActiveTab) => void;
  onOpenMore?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onNavigate,
  onOpenMore,
}) => {
  const handleNav = (tab: ActiveTab) => {
    setActiveTab?.(tab);
    onNavigate?.(tab);
  };

  const items: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'story', label: 'Story', icon: Compass },
    { id: 'memories', label: 'Vault', icon: Image },
    { id: 'places', label: 'Places', icon: MapPin },
    { id: 'letters', label: 'Letters', icon: Mail },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#DFBF99]/20 bg-[#140816]/95 px-2 py-1.5 backdrop-blur-2xl xl:hidden font-sans shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => handleNav(item.id)}
              className={`min-h-[48px] min-w-[48px] flex-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive ? 'text-[#FAF7F2]' : 'text-[#C9B7C3]/70 hover:text-[#FAF7F2]'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[#7D2146] text-[#DFBF99] shadow-md border border-[#DFBF99]/35 ring-2 ring-[#7D2146]/40 scale-105'
                    : 'bg-transparent text-current'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] tracking-wide transition-colors ${isActive ? 'font-semibold text-[#DFBF99]' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          id="mobile-nav-more"
          onClick={onOpenMore}
          className="min-h-[48px] min-w-[48px] flex-1 flex flex-col items-center justify-center gap-1 rounded-xl text-[#C9B7C3]/70 hover:text-[#FAF7F2] transition-all duration-200 active:scale-95"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent hover:bg-white/5">
            <MoreHorizontal className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-normal tracking-wide">More</span>
        </button>
      </div>
    </nav>
  );
};
