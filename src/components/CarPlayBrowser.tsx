import React, { useState } from 'react';
import { ThemeId } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';
import { soundSys } from '../utils/audioSynth';

interface CarPlayBrowserProps {
  theme: ThemeId;
}

interface Bookmark {
  title: string;
  url: string;
  icon: string;
  category: string;
  description: string;
}

export const CarPlayBrowser: React.FC<CarPlayBrowserProps> = ({ theme }) => {
  const currentTheme = THEME_CONFIGS[theme];

  const BOOKMARKS: Bookmark[] = [
    {
      title: 'Google Arama',
      url: 'https://www.google.com/search?igu=1',
      icon: '🔍',
      category: 'Arama',
      description: 'Webde hızlı arama yapın'
    },
    {
      title: 'Wikipedia Özgür Ansiklopedi',
      url: 'https://tr.wikipedia.org',
      icon: '📚',
      category: 'Bilgi',
      description: 'Dünyanın en büyük çevrimiçi ansiklopedisi'
    },
    {
      title: 'Canlı Trafik Kameraları & EDS',
      url: 'https://tkm.ibb.gov.tr',
      icon: '🚦',
      category: 'Trafik',
      description: 'Şehir içi ve otoyol canlı kamera akışları'
    },
    {
      title: 'Akaryakıt & Benzin Fiyatları',
      url: 'https://www.petrolofisi.com.tr',
      icon: '⛽',
      category: 'Yakıt',
      description: 'Güncel motorin, kurşunsuz benzin ve LPG tarifeleri'
    },
    {
      title: 'Hava Durumu & Yağış Radarı',
      url: 'https://mgm.gov.tr',
      icon: '🌦️',
      category: 'Meteoroloji',
      description: 'Canlı meteorolojik yağış ve fırtına radarı'
    },
    {
      title: 'GTA Araç & Lokasyon Veritabanı',
      url: 'https://gta.fandom.com',
      icon: '🏎️',
      category: 'GTA Lore',
      description: 'Vice City ve Los Santos araç katalogları ve hileler'
    }
  ];

  const [currentUrl, setCurrentUrl] = useState<string>('https://tr.wikipedia.org');
  const [inputUrl, setInputUrl] = useState<string>('https://tr.wikipedia.org');
  const [history, setHistory] = useState<string[]>(['https://tr.wikipedia.org']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [showBookmarksModal, setShowBookmarksModal] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  const navigateTo = (url: string) => {
    soundSys.playClick();
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      if (formatted.includes('.') && !formatted.includes(' ')) {
        formatted = `https://${formatted}`;
      } else {
        formatted = `https://www.google.com/search?igu=1&q=${encodeURIComponent(formatted)}`;
      }
    }

    const nextHistory = [...history.slice(0, historyIndex + 1), formatted];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setCurrentUrl(formatted);
    setInputUrl(formatted);
    setIframeKey(k => k + 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      soundSys.playClick();
      const prev = history[historyIndex - 1];
      setHistoryIndex(i => i - 1);
      setCurrentUrl(prev);
      setInputUrl(prev);
      setIframeKey(k => k + 1);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      soundSys.playClick();
      const next = history[historyIndex + 1];
      setHistoryIndex(i => i + 1);
      setCurrentUrl(next);
      setInputUrl(next);
      setIframeKey(k => k + 1);
    }
  };

  const handleReload = () => {
    soundSys.playClick();
    setIframeKey(k => k + 1);
  };

  return (
    <div className="w-full h-full p-2 md:p-4 flex flex-col justify-between overflow-hidden">
      {/* Browser Navigation Toolbar */}
      <div 
        className="rounded-2xl p-2.5 backdrop-blur-xl border flex flex-wrap items-center gap-2 shadow-lg mb-2"
        style={{ 
          backgroundColor: currentTheme.panelBg,
          borderColor: currentTheme.borderGlow 
        }}
      >
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white active:scale-95"
            title="Geri"
          >
            ◀
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white active:scale-95"
            title="İleri"
          >
            ▶
          </button>
          <button
            onClick={handleReload}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95"
            title="Yenile"
          >
            🔄
          </button>
        </div>

        {/* Address & Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            navigateTo(inputUrl);
          }}
          className="flex-1 min-w-[200px] flex items-center bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 focus-within:border-white"
        >
          <span className="text-slate-400 text-xs mr-2">🔒</span>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="URL girin veya Google'da arayın..."
            className="flex-1 bg-transparent text-xs font-hud text-white focus:outline-none placeholder:text-slate-500"
          />
          <button type="submit" className="text-xs font-hud font-bold text-slate-300 hover:text-white px-2">
            GİT
          </button>
        </form>

        {/* Bookmarks Toggle Button */}
        <button
          onClick={() => {
            soundSys.playClick();
            setShowBookmarksModal(!showBookmarksModal);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-hud font-bold border transition-colors flex items-center gap-1.5 ${
            showBookmarksModal ? 'bg-amber-400 text-black border-amber-300' : 'bg-white/10 text-white border-white/20'
          }`}
        >
          <span>⭐</span>
          <span>SÜRÜCÜ SIK KULLANILANLAR</span>
        </button>
      </div>

      {/* Main Browser Viewport */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl">
        {/* Live Iframe */}
        <iframe
          key={iframeKey}
          src={currentUrl}
          title="CarPlay In-Car Browser"
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />

        {/* Bookmarks Overlay Modal */}
        {showBookmarksModal && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 p-4 md:p-8 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-hud font-black text-xl text-white">
                ⭐ CARPLAY HIZLI YER İMLERİ
              </h3>
              <button
                onClick={() => setShowBookmarksModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {BOOKMARKS.map((bm, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    navigateTo(bm.url);
                    setShowBookmarksModal(false);
                  }}
                  className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/15 cursor-pointer transition-all active:scale-98 flex items-start gap-3"
                >
                  <span className="text-2xl p-2 rounded-xl bg-white/10">{bm.icon}</span>
                  <div>
                    <span className="text-[10px] font-hud text-amber-400 uppercase">{bm.category}</span>
                    <h4 className="font-hud font-bold text-sm text-white">{bm.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{bm.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="pt-2 flex items-center justify-between text-[10px] font-hud text-slate-400">
        <span>🌐 CarPlay Güvenli Web Tarayıcısı</span>
        <span>Mevcut Adres: {currentUrl}</span>
      </div>
    </div>
  );
};
