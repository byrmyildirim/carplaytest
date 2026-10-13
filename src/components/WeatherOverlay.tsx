import React, { useEffect, useRef } from 'react';
import { WeatherCondition, WeatherState, ThemeId } from '../types';
import { soundSys } from '../utils/audioSynth';

interface WeatherOverlayProps {
  weather: WeatherState;
  theme: ThemeId;
  showWipers?: boolean;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({
  weather,
  theme,
  showWipers = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lightningActiveRef = useRef<boolean>(false);
  const nextLightningTimeRef = useRef<number>(Date.now() + 4000);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pools
    const raindrops: { x: number; y: number; speed: number; length: number; opacity: number }[] = [];
    const sunParticles: { x: number; y: number; radius: number; vx: number; vy: number; alpha: number }[] = [];
    const fogBlobs: { x: number; y: number; radius: number; vx: number; alpha: number }[] = [];

    // Initialize rain
    const rainCount = weather.condition === 'thunderstorm' ? 240 : weather.condition === 'rain' ? 140 : 0;
    for (let i = 0; i < rainCount; i++) {
      raindrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 16 + Math.random() * 12,
        length: 14 + Math.random() * 16,
        opacity: 0.25 + Math.random() * 0.45
      });
    }

    // Initialize sunny/sunset particles
    const sunCount = (weather.condition === 'sunny' || weather.condition === 'sunset_haze') ? 35 : 0;
    for (let i = 0; i < sunCount; i++) {
      sunParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 2 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.6,
        alpha: 0.1 + Math.random() * 0.35
      });
    }

    // Initialize fog blobs
    const fogCount = weather.condition === 'fog' ? 18 : 0;
    for (let i = 0; i < fogCount; i++) {
      fogBlobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 120 + Math.random() * 180,
        vx: 0.2 + Math.random() * 0.3,
        alpha: 0.08 + Math.random() * 0.12
      });
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. RAIN & THUNDERSTORM
      if (weather.condition === 'rain' || weather.condition === 'thunderstorm') {
        ctx.strokeStyle = weather.condition === 'thunderstorm' ? 'rgba(200, 235, 255, 0.65)' : 'rgba(180, 215, 255, 0.45)';
        ctx.lineWidth = weather.condition === 'thunderstorm' ? 2 : 1.5;

        raindrops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 2;

          if (drop.y > height) {
            drop.y = -drop.length;
            drop.x = Math.random() * width;
          }
        });

        // Thunderstorm lightning flash
        if (weather.condition === 'thunderstorm') {
          const now = Date.now();
          if (now > nextLightningTimeRef.current) {
            lightningActiveRef.current = true;
            nextLightningTimeRef.current = now + 4000 + Math.random() * 6000;
            setTimeout(() => {
              lightningActiveRef.current = false;
            }, 120);
          }

          if (lightningActiveRef.current) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(0, 0, width, height);
          }
        }
      }

      // 2. FOG
      if (weather.condition === 'fog') {
        fogBlobs.forEach((blob) => {
          const grad = ctx.createRadialGradient(blob.x, blob.y, 10, blob.x, blob.y, blob.radius);
          grad.addColorStop(0, `rgba(148, 163, 184, ${blob.alpha * 1.5})`);
          grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
          ctx.fill();

          blob.x += blob.vx;
          if (blob.x - blob.radius > width) {
            blob.x = -blob.radius;
            blob.y = Math.random() * height;
          }
        });
      }

      // 3. SUNNY & SUNSET HAZE
      if (weather.condition === 'sunny' || weather.condition === 'sunset_haze') {
        const isSunset = weather.condition === 'sunset_haze' || theme === 'vice_city';

        // Warm ambient tint
        ctx.fillStyle = isSunset ? 'rgba(244, 63, 94, 0.04)' : 'rgba(250, 204, 21, 0.03)';
        ctx.fillRect(0, 0, width, height);

        sunParticles.forEach((p) => {
          ctx.fillStyle = isSunset ? `rgba(251, 146, 60, ${p.alpha})` : `rgba(253, 224, 71, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.vx;
          p.y += p.vy;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [weather.condition, theme]);

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Atmospheric Vignette Filter for Weather Mood */}
      {weather.condition === 'fog' && (
        <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px] transition-all duration-700" />
      )}
      {weather.condition === 'thunderstorm' && (
        <div className="absolute inset-0 bg-indigo-950/25 transition-all duration-700" />
      )}
      {weather.condition === 'sunset_haze' && (
        <div className="absolute inset-0 bg-gradient-to-t from-pink-950/20 via-transparent to-amber-950/15 pointer-events-none" />
      )}

      {/* Windshield Wiper Animation when raining and wipersActive */}
      {(weather.condition === 'rain' || weather.condition === 'thunderstorm') && weather.wipersActive && showWipers && (
        <div className="absolute inset-x-0 bottom-0 h-44 overflow-hidden pointer-events-none">
          {/* Dual Wipers Swiping */}
          <div 
            className="absolute -bottom-8 left-1/4 w-3 h-52 bg-slate-700/80 origin-bottom rounded-full shadow-2xl border border-slate-500/40 animate-wiperLeft"
            style={{
              animation: 'wiperSwing 1.4s ease-in-out infinite alternate'
            }}
          >
            <div className="w-1.5 h-full bg-slate-900/90 mx-auto" />
          </div>

          <div 
            className="absolute -bottom-8 left-2/3 w-3 h-52 bg-slate-700/80 origin-bottom rounded-full shadow-2xl border border-slate-500/40 animate-wiperRight"
            style={{
              animation: 'wiperSwing 1.4s ease-in-out infinite alternate 0.15s'
            }}
          >
            <div className="w-1.5 h-full bg-slate-900/90 mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
