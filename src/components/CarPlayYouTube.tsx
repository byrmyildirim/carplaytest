import React, { useState } from 'react';
import { ThemeId } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';
import { soundSys } from '../utils/audioSynth';

interface CarPlayYouTubeProps {
  theme: ThemeId;
  isDriving: boolean;
}

interface CuratedVideo {
  id: string;
  title: string;
  channel: string;
  category: string;
  duration: string;
  thumbnail: string;
}

export const CarPlayYouTube: React.FC<CarPlayYouTubeProps> = ({ theme, isDriving }) => {
  const currentTheme = THEME_CONFIGS[theme];

  const CURATED_VIDEOS: CuratedVideo[] = [
    {
      id: 'L_LUpnjgPso', // Synthwave radio / driving stream
      title: 'Synthwave Radio - Chill 80s Retro Electro Driving Beats',
      channel: 'Lofi Girl / Synthwave Boy',
      category: 'Müzik & Sürüş',
      duration: 'CANLI',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 'QdBZY2fkU-0', // GTA VI Official Trailer
      title: 'Grand Theft Auto VI - Official Trailer 1 (Vice City 4K)',
      channel: 'Rockstar Games',
      category: 'GTA Fragman',
      duration: '1:31',
      thumbnail: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 'jfKfPfyJRdk', // Lofi Hip Hop Radio
      title: 'Lofi Hip Hop Radio - Beats to Relax & Cruise To',
      channel: 'Lofi Girl',
      category: 'Lo-Fi Chill',
      duration: 'CANLI',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: '4xDzrJKXOOY', // Synthwave Chillwave
      title: 'GTA Vice City Ocean Beach 80s Night Cruise POV 4K',
      channel: 'Vice City Automotive',
      category: 'Gece Sürüşü',
      duration: '1:02:14',
      thumbnail: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: '9yIp8K3p7vA', // Supercar onboard
      title: 'Nürburgring Nordschleife 911 GT3 RS Full Lap Onboard',
      channel: 'Sport Auto',
      category: 'Pist & Motor Sporları',
      duration: '6:49',
      thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60'
    }
  ];

  const [activeVideoId, setActiveVideoId] = useState<string>(CURATED_VIDEOS[0].id);
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('Tümü');

  const handleSelectVideo = (id: string) => {
    soundSys.playClick();
    setActiveVideoId(id);
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;

    soundSys.playClick();
    let extractedId = customInputUrl.trim();

    // Parse various YouTube URL formats
    if (extractedId.includes('v=')) {
      extractedId = extractedId.split('v=')[1]?.split('&')[0] || extractedId;
    } else if (extractedId.includes('youtu.be/')) {
      extractedId = extractedId.split('youtu.be/')[1]?.split('?')[0] || extractedId;
    } else if (extractedId.includes('embed/')) {
      extractedId = extractedId.split('embed/')[1]?.split('?')[0] || extractedId;
    }

    setActiveVideoId(extractedId);
    setCustomInputUrl('');
  };

  const categories = ['Tümü', 'Müzik & Sürüş', 'GTA Fragman', 'Lo-Fi Chill', 'Gece Sürüşü', 'Pist & Motor Sporları'];

  const filteredVideos = CURATED_VIDEOS.filter(
    v => filterCategory === 'Tümü' || v.category === filterCategory
  );

  return (
    <div className="w-full h-full p-3 md:p-6 flex flex-col justify-between overflow-y-auto max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div>
          <span className="text-[10px] font-hud uppercase tracking-widest text-slate-400">CARPLAY MEDYA & EĞLENCE SİSTEMİ</span>
          <h2 className="text-xl md:text-2xl font-black font-hud text-white tracking-tight flex items-center gap-2">
            <span className="text-rose-500">▶</span> YOUTUBE İZLEME MERKEZİ
          </h2>
        </div>

        {/* Safety Mode Indicator */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-hud font-bold border ${
            isDriving ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
          }`}>
            {isDriving ? '⚠️ ARAÇ HAREKET HALİNDE (DİKKAT)' : '🅿️ PARK HALİNDE (İZLEMEYE UYGUN)'}
          </span>
        </div>
      </div>

      {/* Main Player & Playlist Grid */}
      <div className="my-auto py-3 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Video Player */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Responsive YouTube Embed Container */}
          <div 
            className="w-full aspect-video rounded-3xl overflow-hidden border-2 shadow-2xl relative bg-black"
            style={{ 
              borderColor: currentTheme.borderGlow,
              boxShadow: `0 0 30px ${currentTheme.primaryColor}33`
            }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Custom YouTube URL / Video ID Input Form */}
          <form onSubmit={handleLoadCustomUrl} className="flex gap-2">
            <input
              type="text"
              placeholder="YouTube Video Linki veya Video ID yapıştırın (Örn: https://youtube.com/watch?v=...)..."
              value={customInputUrl}
              onChange={(e) => setCustomInputUrl(e.target.value)}
              className="flex-1 bg-black/60 border border-white/20 rounded-2xl px-4 py-2.5 text-xs font-hud text-white placeholder:text-slate-500 focus:outline-none focus:border-white"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-hud font-bold text-black uppercase tracking-wider active:scale-95 transition-transform"
              style={{ backgroundColor: currentTheme.secondaryColor }}
            >
              VİDEOYU OYNAT 📺
            </button>
          </form>
        </div>

        {/* Right 4 Cols: Curated Automotive & GTA Playlists */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 max-h-[460px] overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-hud font-bold text-slate-300 uppercase">
              ÖNERİLEN OTOYOL LİSTELERİ:
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-hud whitespace-nowrap transition-colors ${
                  filterCategory === cat ? 'bg-white text-black font-bold' : 'bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredVideos.map((video) => {
              const isSelected = activeVideoId === video.id;
              return (
                <div
                  key={video.id}
                  onClick={() => handleSelectVideo(video.id)}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected 
                      ? 'border-white bg-white/20 shadow-lg' 
                      : 'border-white/10 bg-black/40 hover:bg-white/10'
                  }`}
                  style={{
                    borderColor: isSelected ? currentTheme.primaryColor : undefined
                  }}
                >
                  {/* Thumbnail / Video badge */}
                  <div className="w-16 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/15 text-lg font-hud font-bold text-white relative overflow-hidden">
                    <span>🎬</span>
                    <span className="absolute bottom-0.5 right-1 text-[8px] bg-black/80 px-1 rounded text-white font-mono">
                      {video.duration}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-hud font-bold text-xs text-white truncate leading-tight">
                      {video.title}
                    </h4>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {video.channel} · <span className="text-amber-400">{video.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* In-Car Safety Footer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-hud text-slate-400">
        <span>🚗 Sürüş güvenliği gereği videolar yalnızca araç güvenli durumdayken izlenmelidir.</span>
        <span className="text-slate-300">CarPlay v2.6 Multimedya Modu</span>
      </div>
    </div>
  );
};
