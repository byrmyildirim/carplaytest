import React, { useState, useEffect, useRef } from 'react';
import { ThemeId, VehicleModel } from '../types';
import { THEME_CONFIGS } from '../utils/themeConfig';
import { VEHICLE_SPECS } from '../data/gtaLocations';
import { soundSys } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface ArcadeGamesProps {
  theme: ThemeId;
  vehicle: VehicleModel;
}

type ActiveGame = 'menu' | 'traffic_chase' | 'speed_reflex' | 'nav_quiz';

export const ArcadeGames: React.FC<ArcadeGamesProps> = ({ theme, vehicle }) => {
  const currentTheme = THEME_CONFIGS[theme];
  const vehicleSpec = VEHICLE_SPECS[vehicle];
  const [activeGame, setActiveGame] = useState<ActiveGame>('menu');

  // Traffic Chase State
  const [chaseScore, setChaseScore] = useState<number>(0);
  const [chaseCash, setChaseCash] = useState<number>(0);
  const [chaseGameOver, setChaseGameOver] = useState<boolean>(false);
  const [chaseHighScore, setChaseHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('gta_chase_high') || '0', 10);
  });
  const chaseLaneRef = useRef<number>(1); // 0: left, 1: center, 2: right
  const [playerLane, setPlayerLane] = useState<number>(1);
  const chaseEnemiesRef = useRef<{ id: number; lane: number; y: number; isCash: boolean }[]>([]);
  const chaseFrameRef = useRef<number | null>(null);

  // Speed Reflex State
  const [reflexState, setReflexState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [reflexTimeMs, setReflexTimeMs] = useState<number | null>(null);
  const reflexTimerStartRef = useRef<number>(0);
  const reflexTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quiz State
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const QUIZ_QUESTIONS = [
    {
      q: 'Vice City sahilinde polisten kaçarken en güvenli ve aranma seviyesini sıfırlayan yer neresidir?',
      options: ['Pay \'n\' Spray Atölyesi', 'Malibu Club Dans Pisti', 'Escobar Jet Pisti', 'Ocean View Balkonu'],
      correct: 0,
      tip: 'Pay \'n\' Spray aracınızı anında boyayıp polis radarlarını temizler.'
    },
    {
      q: 'GTA V Los Santos haritasındaki en yüksek gökdelen hangisidir?',
      options: ['Maze Bank Kulesi', 'FIB Binası', 'Vinewood Kulesi', 'Union Depository'],
      correct: 0,
      tip: 'Maze Bank çatı helikopter pistiyle şehrin zirvesindedir.'
    },
    {
      q: 'CarPlay ekranında navigasyon kullanılırken en kritik sürüş güvenliği kuralı nedir?',
      options: ['Büyük ve tek dokunuşlu kontrollere odaklanmak', 'Ekrandan video izlemek', 'Haritayı sürekli kaydırmak', 'Sesi tamamen kapatmak'],
      correct: 0,
      tip: 'CarPlay ergonomisi sürücünün gözünü yoldan ayırmamasını hedefler.'
    },
    {
      q: 'K-DST radyo istasyonunun efsanevi DJ\'i kimdir?',
      options: ['Tommy "The Nightmare" Smith', 'Lazlow Jones', 'Toni', 'Fernando Martinez'],
      correct: 0,
      tip: 'The Dust, klasik çöl rock ritimlerinin babasıdır.'
    }
  ];

  // ----------------------------------------------------
  // TRAFFIC CHASE GAME LOOP
  // ----------------------------------------------------
  const startTrafficChase = () => {
    soundSys.playClick();
    chaseLaneRef.current = 1;
    setPlayerLane(1);
    setChaseScore(0);
    setChaseCash(0);
    setChaseGameOver(false);
    chaseEnemiesRef.current = [];
    setActiveGame('traffic_chase');
  };

  useEffect(() => {
    if (activeGame !== 'traffic_chase' || chaseGameOver) return;

    let nextSpawn = 0;
    let enemyId = 0;

    const loop = () => {
      // Move existing enemies down
      chaseEnemiesRef.current = chaseEnemiesRef.current
        .map(e => ({ ...e, y: e.y + 4.5 }))
        .filter(e => e.y < 420);

      // Check collisions or pickups
      chaseEnemiesRef.current.forEach(e => {
        if (e.y > 300 && e.y < 360 && e.lane === chaseLaneRef.current) {
          if (e.isCash) {
            // Picked up cash
            soundSys.playCheckpoint();
            setChaseCash(c => c + 250);
            setChaseScore(s => s + 50);
            e.y = 999; // remove
          } else {
            // Crash!
            soundSys.playCrashSound();
            setChaseGameOver(true);
            setChaseHighScore(prev => {
              const best = Math.max(prev, chaseScore);
              localStorage.setItem('gta_chase_high', best.toString());
              return best;
            });
          }
        }
      });

      // Spawn new vehicles or cash
      nextSpawn++;
      if (nextSpawn > 32) {
        nextSpawn = 0;
        enemyId++;
        const lane = Math.floor(Math.random() * 3);
        const isCash = Math.random() < 0.28;
        chaseEnemiesRef.current.push({
          id: enemyId,
          lane,
          y: -40,
          isCash
        });
      }

      setChaseScore(s => s + 1);
      chaseFrameRef.current = requestAnimationFrame(loop);
    };

    chaseFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (chaseFrameRef.current) cancelAnimationFrame(chaseFrameRef.current);
    };
  }, [activeGame, chaseGameOver, chaseScore]);

  const moveLane = (dir: -1 | 1) => {
    soundSys.playClick();
    const next = Math.max(0, Math.min(2, chaseLaneRef.current + dir));
    chaseLaneRef.current = next;
    setPlayerLane(next);
  };

  // Keyboard controls for game
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeGame === 'traffic_chase' && !chaseGameOver) {
        if (e.key === 'ArrowLeft' || e.key === 'a') moveLane(-1);
        if (e.key === 'ArrowRight' || e.key === 'd') moveLane(1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeGame, chaseGameOver]);

  // ----------------------------------------------------
  // SPEED REFLEX GAME
  // ----------------------------------------------------
  const startReflexTest = () => {
    soundSys.playClick();
    setReflexState('waiting');
    setReflexTimeMs(null);
    setActiveGame('speed_reflex');

    const delay = 1500 + Math.random() * 2500;
    reflexTimeoutRef.current = setTimeout(() => {
      soundSys.playSpeedCameraWarning();
      reflexTimerStartRef.current = Date.now();
      setReflexState('ready');
    }, delay);
  };

  const handleReflexTap = () => {
    if (reflexState === 'waiting') {
      // False start!
      if (reflexTimeoutRef.current) clearTimeout(reflexTimeoutRef.current);
      soundSys.playCrashSound();
      setReflexTimeMs(-1);
      setReflexState('result');
    } else if (reflexState === 'ready') {
      const ms = Date.now() - reflexTimerStartRef.current;
      soundSys.playCheckpoint();
      setReflexTimeMs(ms);
      setReflexState('result');
      if (ms < 300) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
    }
  };

  // ----------------------------------------------------
  // QUIZ GAME
  // ----------------------------------------------------
  const startQuiz = () => {
    soundSys.playClick();
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setSelectedOption(null);
    setActiveGame('nav_quiz');
  };

  const handleSelectQuizOption = (idx: number) => {
    if (quizAnswered) return;
    setSelectedOption(idx);
    setQuizAnswered(true);
    const isCorrect = idx === QUIZ_QUESTIONS[quizIndex].correct;
    if (isCorrect) {
      soundSys.playCheckpoint();
      setQuizScore(s => s + 100);
      confetti({ particleCount: 30, spread: 50 });
    } else {
      soundSys.playCrashSound();
    }
  };

  const nextQuizQuestion = () => {
    soundSys.playClick();
    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex(i => i + 1);
      setQuizAnswered(false);
      setSelectedOption(null);
    } else {
      // Completed quiz
      soundSys.playCheckpoint();
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col justify-between overflow-y-auto max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-hud uppercase tracking-widest text-slate-400">CARPLAY PARK HALİ EĞLENCESİ</span>
          <h2 className="text-2xl md:text-3xl font-black font-hud text-white tracking-tight">
            🎮 GTA ARCADE & OYUN MERKEZİ
          </h2>
        </div>
        {activeGame !== 'menu' && (
          <button
            onClick={() => {
              soundSys.playClick();
              setActiveGame('menu');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-hud font-bold text-white transition-all active:scale-95"
          >
            ← OYUN MENÜSÜ
          </button>
        )}
      </div>

      {/* ----------------- GAME 1: MAIN MENU ----------------- */}
      {activeGame === 'menu' && (
        <div className="my-auto py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Traffic Chase */}
          <div 
            onClick={startTrafficChase}
            className="rounded-3xl border p-6 backdrop-blur-xl flex flex-col justify-between cursor-pointer hover:border-white transition-all shadow-2xl hover:scale-[1.02] active:scale-98 group"
            style={{ 
              backgroundColor: currentTheme.panelBg,
              borderColor: currentTheme.borderGlow 
            }}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-2xl shadow-lg mb-4">
                🏎️
              </div>
              <h3 className="font-hud font-black text-2xl text-white group-hover:text-pink-400 transition-colors">
                Vice City Otoyol Kovalamacası
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Trafikteki sivil araçları solla, polis barikatlarından kaç ve yoldaki para çantalarını topla!
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-hud">
              <span className="text-slate-400">EN YÜKSEK SKOR: <b className="text-amber-400">{chaseHighScore}</b></span>
              <span className="text-pink-400 font-bold">OYNA →</span>
            </div>
          </div>

          {/* Card 2: Radar Reflex */}
          <div 
            onClick={startReflexTest}
            className="rounded-3xl border p-6 backdrop-blur-xl flex flex-col justify-between cursor-pointer hover:border-white transition-all shadow-2xl hover:scale-[1.02] active:scale-98 group"
            style={{ 
              backgroundColor: currentTheme.panelBg,
              borderColor: currentTheme.borderGlow 
            }}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-2xl shadow-lg mb-4">
                ⚡
              </div>
              <h3 className="font-hud font-black text-2xl text-white group-hover:text-amber-400 transition-colors">
                Radar & EDS Refleks Testi
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Hız radarı yanıp söndüğü salisede frene bas! Tepki hızını milisaniye bazında ölç.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-hud">
              <span className="text-slate-400">REKOR HEDEF: <b className="text-emerald-400">&lt;220 ms</b></span>
              <span className="text-amber-400 font-bold">OYNA →</span>
            </div>
          </div>

          {/* Card 3: GTA Nav Trivia */}
          <div 
            onClick={startQuiz}
            className="rounded-3xl border p-6 backdrop-blur-xl flex flex-col justify-between cursor-pointer hover:border-white transition-all shadow-2xl hover:scale-[1.02] active:scale-98 group"
            style={{ 
              backgroundColor: currentTheme.panelBg,
              borderColor: currentTheme.borderGlow 
            }}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-2xl shadow-lg mb-4">
                🎯
              </div>
              <h3 className="font-hud font-black text-2xl text-white group-hover:text-emerald-400 transition-colors">
                GTA & Sürüş Genel Kültür Quiz
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Vice City ve Los Santos sokakları, radyo kanalları ve sürüş ipuçları hakkında yolcu bilgi yarışması.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-hud">
              <span className="text-slate-400">4 SORULUK TUR</span>
              <span className="text-emerald-400 font-bold">BAŞLA →</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- GAME 1: TRAFFIC CHASE CANVAS ----------------- */}
      {activeGame === 'traffic_chase' && (
        <div className="my-auto flex flex-col items-center">
          {/* Game Scoreboard */}
          <div className="flex items-center gap-6 mb-3 text-sm font-hud">
            <div>MESAFE: <b className="text-white text-lg tabular-nums">{chaseScore} m</b></div>
            <div>NAKİT: <b className="text-emerald-400 text-lg tabular-nums">${chaseCash}</b></div>
            <div>REKOR: <b className="text-amber-400 text-lg tabular-nums">{chaseHighScore}</b></div>
          </div>

          {/* 3-Lane Highway Container */}
          <div className="relative w-80 md:w-96 h-[400px] bg-slate-950 border-4 border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            {/* Animated Road Lines */}
            <div className="absolute inset-0 flex justify-between px-28 md:px-32 pointer-events-none">
              <div className="w-1 h-full border-r-2 border-dashed border-yellow-400/40" />
              <div className="w-1 h-full border-r-2 border-dashed border-yellow-400/40" />
            </div>

            {/* Enemies & Cash */}
            {chaseEnemiesRef.current.map(e => {
              const laneX = e.lane === 0 ? 'left-6 md:left-8' : e.lane === 1 ? 'left-[132px] md:left-[160px]' : 'right-6 md:right-8';
              return (
                <div
                  key={e.id}
                  className={`absolute ${laneX} w-12 h-14 flex items-center justify-center transition-all`}
                  style={{ top: `${e.y}px` }}
                >
                  {e.isCash ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500 border border-white text-white flex items-center justify-center font-hud font-black text-xs shadow-lg animate-bounce">
                      $$$
                    </div>
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-rose-600 border border-rose-300 flex items-center justify-center shadow-lg text-lg">
                      🚔
                    </div>
                  )}
                </div>
              );
            })}

            {/* Player Car */}
            <div 
              className={`absolute bottom-4 ${
                playerLane === 0 ? 'left-6 md:left-8' : playerLane === 1 ? 'left-[132px] md:left-[160px]' : 'right-6 md:right-8'
              } w-12 h-16 rounded-xl flex items-center justify-center border-2 border-white shadow-2xl transition-all duration-100`}
              style={{ backgroundColor: vehicleSpec.color }}
            >
              <span className="text-xl">🏎️</span>
            </div>

            {/* Game Over Overlay */}
            {chaseGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                <span className="font-hud font-black text-3xl text-rose-500 tracking-wider">
                  KAZA YAPTINIZ!
                </span>
                <p className="text-xs text-slate-300 mt-2">
                  Toplam Skor: <b>{chaseScore}</b> · Toplanan Nakit: <b>${chaseCash}</b>
                </p>
                <button
                  onClick={startTrafficChase}
                  className="mt-6 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-hud font-bold text-sm shadow-xl active:scale-95 transition-transform"
                >
                  TEKRAR DENE 🔄
                </button>
              </div>
            )}
          </div>

          {/* Steer Buttons for Touch / CarPlay */}
          <div className="flex items-center gap-6 mt-4">
            <button
              onClick={() => moveLane(-1)}
              className="w-20 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-white font-hud font-black text-2xl active:scale-95 shadow-xl flex items-center justify-center"
            >
              ◀ SOL
            </button>
            <button
              onClick={() => moveLane(1)}
              className="w-20 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-white font-hud font-black text-2xl active:scale-95 shadow-xl flex items-center justify-center"
            >
              SAĞ ▶
            </button>
          </div>
        </div>
      )}

      {/* ----------------- GAME 2: SPEED REFLEX TEST ----------------- */}
      {activeGame === 'speed_reflex' && (
        <div className="my-auto flex flex-col items-center max-w-md mx-auto w-full">
          <div 
            onClick={handleReflexTap}
            className={`w-full h-80 rounded-3xl border-4 flex flex-col items-center justify-center p-6 cursor-pointer shadow-2xl transition-all select-none ${
              reflexState === 'waiting' 
                ? 'bg-rose-950/70 border-rose-500 animate-pulse' 
                : reflexState === 'ready' 
                ? 'bg-emerald-600 border-white scale-105' 
                : 'bg-slate-900 border-white/20'
            }`}
          >
            {reflexState === 'idle' && (
              <span className="font-hud font-bold text-lg text-white">BAŞLAMAK İÇİN DOKUN</span>
            )}
            {reflexState === 'waiting' && (
              <div className="text-center">
                <span className="text-4xl">🔴</span>
                <div className="font-hud font-black text-2xl text-rose-300 mt-3">RADAR BEKLENİYOR...</div>
                <div className="text-xs text-rose-200 mt-1">Yeşil olana kadar dokunma!</div>
              </div>
            )}
            {reflexState === 'ready' && (
              <div className="text-center">
                <span className="text-5xl">🟢</span>
                <div className="font-hud font-black text-4xl text-white mt-3">ŞİMDİ FRENE BAS!</div>
              </div>
            )}
            {reflexState === 'result' && (
              <div className="text-center">
                {reflexTimeMs === -1 ? (
                  <>
                    <span className="text-4xl">⚠️</span>
                    <div className="font-hud font-black text-2xl text-rose-400 mt-2">ERKEN BASTINIZ!</div>
                    <div className="text-xs text-slate-300 mt-1">Radar yanmadan önce dokunamazsınız.</div>
                  </>
                ) : (
                  <>
                    <span className="text-4xl">⚡</span>
                    <div className="font-hud font-black text-5xl text-emerald-400 mt-2 tabular-nums">
                      {reflexTimeMs} ms
                    </div>
                    <div className="text-xs font-hud text-slate-300 mt-2">
                      {reflexTimeMs! < 250 ? '🏆 VICE CITY EFSANESİ REFLEKSİ!' : reflexTimeMs! < 350 ? '👏 İYİ REFLEKS!' : '🐢 BİRAZ YAVAŞ, DİKKAT ET!'}
                    </div>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startReflexTest();
                  }}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-white text-black font-hud font-bold text-xs shadow-lg active:scale-95"
                >
                  YENİDEN DENE
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- GAME 3: NAV QUIZ ----------------- */}
      {activeGame === 'nav_quiz' && (
        <div className="my-auto max-w-2xl mx-auto w-full">
          <div 
            className="rounded-3xl border p-6 md:p-8 backdrop-blur-2xl shadow-2xl"
            style={{ 
              backgroundColor: currentTheme.panelBg,
              borderColor: currentTheme.borderGlow 
            }}
          >
            <div className="flex items-center justify-between text-xs font-hud text-slate-400 pb-4 border-b border-white/10">
              <span>SORU {quizIndex + 1} / {QUIZ_QUESTIONS.length}</span>
              <span>TOPLAM PUAN: <b className="text-emerald-400">{quizScore}</b></span>
            </div>

            <h3 className="font-hud font-bold text-xl md:text-2xl text-white mt-4 leading-snug">
              {QUIZ_QUESTIONS[quizIndex].q}
            </h3>

            <div className="mt-6 space-y-3">
              {QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === QUIZ_QUESTIONS[quizIndex].correct;
                let btnStyle = 'bg-white/5 border-white/10 hover:bg-white/10 text-white';

                if (quizAnswered) {
                  if (isCorrect) btnStyle = 'bg-emerald-600/90 border-emerald-400 text-white font-bold';
                  else if (isSelected) btnStyle = 'bg-rose-600/90 border-rose-400 text-white';
                }

                return (
                  <button
                    key={idx}
                    disabled={quizAnswered}
                    onClick={() => handleSelectQuizOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left font-hud text-sm transition-all active:scale-98 flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {quizAnswered && isCorrect && <span>✓ DOĞRU</span>}
                    {quizAnswered && isSelected && !isCorrect && <span>✕ YANLIŞ</span>}
                  </button>
                );
              })}
            </div>

            {quizAnswered && (
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-hud">
                  💡 {QUIZ_QUESTIONS[quizIndex].tip}
                </span>
                <button
                  onClick={nextQuizQuestion}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-hud font-black text-xs shadow-lg active:scale-95"
                >
                  {quizIndex < QUIZ_QUESTIONS.length - 1 ? 'SONRAKİ SORU →' : 'SONUÇLARI BİTİR'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="text-center text-[11px] text-slate-400 font-hud pt-2">
        ⚠️ Park halinde iken oynanmalıdır. Gerçek sürüş sırasında sadece yolcu tarafından kullanılabilir.
      </div>
    </div>
  );
};
