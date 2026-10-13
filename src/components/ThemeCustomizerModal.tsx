import React from 'react';
import { UserCarPlaySettings, ThemeId, VehicleModel } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';
import { VEHICLE_SPECS } from '../data/gtaLocations';
import { soundSys } from '../utils/audioSynth';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserCarPlaySettings;
  onUpdateSettings: (newSettings: UserCarPlaySettings) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const currentTheme = THEME_CONFIGS[settings.theme];

  if (!isOpen) return null;

  const updateSetting = <K extends keyof UserCarPlaySettings>(key: K, value: UserCarPlaySettings[K]) => {
    soundSys.playClick();
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl border p-4 md:p-8 backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-hidden"
        style={{ 
          backgroundColor: currentTheme.panelBg,
          borderColor: currentTheme.borderGlow 
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div>
            <span className="text-[10px] font-hud uppercase tracking-widest text-slate-400">CARPLAY KİŞİSELLEŞTİRME</span>
            <h2 className="text-xl md:text-2xl font-black font-hud text-white tracking-tight">
              🎨 TEMA, ARAÇ & NAVİGASYON AYARLARI
            </h2>
          </div>
          <button
            onClick={() => {
              soundSys.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Section 1: GTA Themes */}
          <div className="space-y-3">
            <span className="text-xs font-hud font-bold text-slate-300 uppercase">
              1. GTA OYUN ARAYÜZÜ & TEMA MODELİ:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(THEME_CONFIGS) as ThemeId[]).map((thmId) => {
                const t = THEME_CONFIGS[thmId];
                const isSelected = settings.theme === thmId;
                return (
                  <div
                    key={thmId}
                    onClick={() => updateSetting('theme', thmId)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-white bg-white/20 shadow-xl scale-[1.02]' 
                        : 'border-white/10 bg-black/40 hover:bg-white/5'
                    }`}
                    style={{
                      borderColor: isSelected ? t.primaryColor : undefined
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-hud font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: t.primaryColor }}>
                          {t.yearEra}
                        </span>
                        {isSelected && <span className="text-xs font-bold text-white">✓ SEÇİLDİ</span>}
                      </div>
                      <h4 className="font-hud font-black text-base text-white mt-2">
                        {t.name}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {t.vibe}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
                      <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: t.primaryColor }} />
                      <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: t.secondaryColor }} />
                      <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: t.accentColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Vehicle Selection */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <span className="text-xs font-hud font-bold text-slate-300 uppercase">
              2. SÜRÜCÜ ARACI & MODELİ:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {(Object.keys(VEHICLE_SPECS) as VehicleModel[]).map((vId) => {
                const v = VEHICLE_SPECS[vId];
                const isSelected = settings.vehicle === vId;
                return (
                  <div
                    key={vId}
                    onClick={() => updateSetting('vehicle', vId)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left ${
                      isSelected 
                        ? 'border-white bg-white/20 shadow-lg scale-102' 
                        : 'border-white/10 bg-black/40 hover:bg-white/5'
                    }`}
                    style={{
                      borderColor: isSelected ? v.color : undefined
                    }}
                  >
                    <div>
                      <span className="text-[10px] font-hud text-slate-400">{v.category}</span>
                      <h5 className="font-hud font-black text-sm text-white truncate mt-1">
                        {v.name}
                      </h5>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-hud text-slate-300">
                      <div>HIZ: <b className="text-amber-400">{v.topSpeedKmh} km/s</b></div>
                      <div className="truncate">{v.acceleration}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Navigation Preferences & Driver Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            {/* Nav & Audio Preferences */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-hud font-bold text-slate-300 uppercase">
                3. BİRİM & SES TERCİHLERİ:
              </span>

              {/* Speed Unit */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-hud text-slate-300">HIZ BİRİMİ:</span>
                <div className="flex items-center gap-1 p-1 bg-white/10 rounded-xl">
                  <button
                    onClick={() => updateSetting('speedUnit', 'kmh')}
                    className={`px-3 py-1 rounded-lg text-xs font-hud ${settings.speedUnit === 'kmh' ? 'bg-white text-black font-bold' : 'text-slate-300'}`}
                  >
                    KM/S
                  </button>
                  <button
                    onClick={() => updateSetting('speedUnit', 'mph')}
                    className={`px-3 py-1 rounded-lg text-xs font-hud ${settings.speedUnit === 'mph' ? 'bg-white text-black font-bold' : 'text-slate-300'}`}
                  >
                    MPH
                  </button>
                </div>
              </div>

              {/* Voice Prompt Language */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-hud text-slate-300">SESLİ REHBER DİLİ:</span>
                <div className="flex items-center gap-1 p-1 bg-white/10 rounded-xl">
                  <button
                    onClick={() => updateSetting('voiceLanguage', 'tr')}
                    className={`px-3 py-1 rounded-lg text-xs font-hud ${settings.voiceLanguage === 'tr' ? 'bg-white text-black font-bold' : 'text-slate-300'}`}
                  >
                    Türkçe 🇹🇷
                  </button>
                  <button
                    onClick={() => updateSetting('voiceLanguage', 'en')}
                    className={`px-3 py-1 rounded-lg text-xs font-hud ${settings.voiceLanguage === 'en' ? 'bg-white text-black font-bold' : 'text-slate-300'}`}
                  >
                    English 🇺🇸
                  </button>
                </div>
              </div>

              {/* Voice Assistant Persona */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-hud text-slate-300">ASİSTAN TONU:</span>
                <select
                  value={settings.voiceStyle}
                  onChange={(e) => updateSetting('voiceStyle', e.target.value as any)}
                  className="bg-slate-800 text-white rounded-lg px-2 py-1 text-xs font-hud border border-white/20"
                >
                  <option value="vice_dj">Vice City DJ</option>
                  <option value="tactical_cop">Polis Telsiz Operatörü</option>
                  <option value="cj_san_andreas">CJ San Andreas</option>
                  <option value="classic_gps">Klasik GPS</option>
                </select>
              </div>

              {/* Weather Preset Setting */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-hud text-slate-300">HAVA DURUMU SİSTEMİ:</span>
                <select
                  value={settings.weatherMode}
                  onChange={(e) => updateSetting('weatherMode', e.target.value as any)}
                  className="bg-slate-800 text-white rounded-lg px-2 py-1 text-xs font-hud border border-white/20"
                >
                  <option value="auto">🌐 Temaya Göre Otomatik</option>
                  <option value="sunny">☀️ Tropikal Güneşli</option>
                  <option value="sunset_haze">🌆 Vice Sunset Haze</option>
                  <option value="fog">🌫️ Yoğun Sis (Noir)</option>
                  <option value="rain">🌧️ Yağmurlu Asfalt</option>
                  <option value="thunderstorm">⛈️ Gök Gürültülü Fırtına</option>
                </select>
              </div>
            </div>

            {/* License Plate & Driver Customization */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-hud font-bold text-slate-300 uppercase">
                4. PLAKA & SÜRÜCÜ KİMLİĞİ:
              </span>

              <div>
                <label className="text-[10px] font-hud text-slate-400 block mb-1">ÖZEL PLAKA</label>
                <input
                  type="text"
                  maxLength={10}
                  value={settings.licensePlate}
                  onChange={(e) => updateSetting('licensePlate', e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-sm font-hud font-black text-amber-400 uppercase tracking-widest"
                />
              </div>

              <div>
                <label className="text-[10px] font-hud text-slate-400 block mb-1">SÜRÜCÜ ADI / KOD ADI</label>
                <input
                  type="text"
                  maxLength={16}
                  value={settings.driverName}
                  onChange={(e) => updateSetting('driverName', e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-sm font-hud font-bold text-white tracking-wide"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-hud text-slate-300">POLİS ARANMA SİSTEMİ</span>
                <input
                  type="checkbox"
                  checked={settings.wantedLevelSystem}
                  onChange={(e) => updateSetting('wantedLevelSystem', e.target.checked)}
                  className="w-5 h-5 accent-pink-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={() => {
              soundSys.playCheckpoint();
              onClose();
            }}
            className="px-8 py-3 rounded-2xl text-white font-hud font-black text-sm tracking-wide shadow-xl active:scale-95 transition-all"
            style={{ backgroundColor: currentTheme.primaryColor }}
          >
            AYARLARI KAYDET & DÖN ✓
          </button>
        </div>
      </div>
    </div>
  );
};
