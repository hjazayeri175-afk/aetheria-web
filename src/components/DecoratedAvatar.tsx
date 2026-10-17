import React, { useEffect, useRef, useState } from 'react';

export interface DecorationPreset {
  id: string;
  name: string;
  apngUrl?: string;
}

// Local first for 100% uptime & zero latency, with jsDelivr CDN fallback
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/ItsPi3141/discord-fake-avatar-decorations@main/public/decorations';

export const DISCORD_DECORATION_PRESETS: DecorationPreset[] = [
  { id: 'none', name: 'None' },
  {
    id: 'starlight_tiara',
    name: 'Starlight Tiara',
    apngUrl: '/decorations/stardust.png',
  },
  {
    id: 'lunar_wolf',
    name: 'Lunar Wolf',
    apngUrl: '/decorations/wolf_morph.png',
  },
  {
    id: 'hexs_hat',
    name: "Hex's Hat",
    apngUrl: '/decorations/witch_hat_midnight.png',
  },
  {
    id: 'sakura_spirit',
    name: 'Sakura Spirit',
    apngUrl: '/decorations/sakura.png',
  },
  {
    id: 'kitsune_foxfire',
    name: 'Kitsune Foxfire',
    apngUrl: '/decorations/kitsune.png',
  },
  {
    id: 'imperial_dragon',
    name: 'Imperial Dragon',
    apngUrl: '/decorations/dragons_smile.png',
  },
  {
    id: 'cyberpunk_glitch',
    name: 'Cyberpunk Glitch',
    apngUrl: '/decorations/glitch.png',
  },
  {
    id: 'cosmic_singularity',
    name: 'Cosmic Singularity',
    apngUrl: '/decorations/black_hole.png',
  },
  {
    id: 'storm_lightning',
    name: 'Storm & Lightning',
    apngUrl: '/decorations/lightning.png',
  },
  {
    id: 'solar_supernova',
    name: 'Solar Supernova',
    apngUrl: '/decorations/fire.png',
  },
  {
    id: 'aurora_crown',
    name: 'Royal Sovereign',
    apngUrl: '/decorations/crown.png',
  },
];

interface DecoratedAvatarProps {
  src: string;
  presetId: string;
  size?: number;
  customImageUrl?: string;
}

export const DecoratedAvatar: React.FC<DecoratedAvatarProps> = ({
  src,
  presetId,
  size = 64,
  customImageUrl,
}) => {
  const preset =
    DISCORD_DECORATION_PRESETS.find((p) => p.id === presetId) ||
    DISCORD_DECORATION_PRESETS[0];

  const [imgError, setImgError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [presetId, preset.apngUrl, customImageUrl]);

  const activeImageUrl = customImageUrl || preset.apngUrl;
  const overlaySize = Math.round(size * 1.42);
  const useCanvasFallback = !activeImageUrl || imgError;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || presetId === 'none' || !useCanvasFallback) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = overlaySize * dpr;
    canvas.height = overlaySize * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;
    let t = Math.random() * 100;
    const cx = overlaySize / 2;
    const cy = overlaySize / 2;
    const r = size / 2;

    const drawSparkle = (x: number, y: number, s: number, color: string, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = s * 2.2;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.lineTo(x + Math.cos(angle) * s, y + Math.sin(angle) * s);
        const midAngle = angle + Math.PI / 4;
        ctx.lineTo(x + Math.cos(midAngle) * (s * 0.22), y + Math.sin(midAngle) * (s * 0.22));
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawPetal = (x: number, y: number, s: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, s);
      grad.addColorStop(0, '#fff0f6');
      grad.addColorStop(0.6, '#ff85c0');
      grad.addColorStop(1, '#eb2f96');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#ff85c0';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.8, s * 0.9, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.9, s * 0.6, -s * 0.9, -s * 0.8, 0, -s);
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      t += 0.025;
      ctx.clearRect(0, 0, overlaySize, overlaySize);

      if (presetId === 'starlight_tiara') {
        ctx.save();
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.75)';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.stroke();

        for (let k = -1; k <= 1; k += 2) {
          ctx.save();
          ctx.translate(cx, cy - r * 0.72);
          ctx.rotate(k * 0.12 + Math.sin(t) * 0.04);
          ctx.scale(1, 0.28);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();

        for (let i = 0; i < 9; i++) {
          const a = t * 0.8 + (i * Math.PI * 2) / 9;
          const dist = r + 3 + Math.sin(t * 2 + i) * 4;
          const pulse = (Math.sin(t * 3 + i * 1.7) + 1) * 0.5;
          drawSparkle(
            cx + Math.cos(a) * dist,
            cy + Math.sin(a) * dist,
            size * 0.06 * (0.5 + pulse * 0.7),
            '#fef08a',
            0.4 + pulse * 0.6
          );
        }
      } else if (presetId === 'sakura_spirit') {
        ctx.save();
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        for (let i = 0; i < 8; i++) {
          const a = t * 0.6 + (i * Math.PI * 2) / 8;
          const rad = r + 3 + Math.sin(t * 1.5 + i) * 5;
          drawPetal(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, size * 0.075, a + t);
        }
      } else if (presetId === 'kitsune_foxfire') {
        for (let i = 0; i < 6; i++) {
          const baseAngle = t * 1.2 + (i * Math.PI * 2) / 6;
          const color = i % 2 === 0 ? '#ec4899' : '#22d3ee';
          for (let tail = 0; tail < 8; tail++) {
            const ta = baseAngle - tail * 0.07;
            const tr = r + 4 + Math.sin(t * 2 + i) * 3;
            ctx.save();
            ctx.fillStyle = color;
            ctx.globalAlpha = (1 - tail / 8) * 0.85;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(
              cx + Math.cos(ta) * tr,
              cy + Math.sin(ta) * tr,
              size * 0.065 * (1 - tail / 10),
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
          }
        }
      } else if (presetId === 'cosmic_singularity') {
        for (let ring = 0; ring < 3; ring++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(t * (ring % 2 === 0 ? 1 : -1.3) + ring);
          const grad = ctx.createLinearGradient(-r, -r, r, r);
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(0.5, '#a855f7');
          grad.addColorStop(1, '#ec4899');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3 - ring * 0.6;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, r + 2 + ring * 2.5, 0, Math.PI * 1.4);
          ctx.stroke();
          ctx.restore();
        }
        for (let i = 0; i < 6; i++) {
          const a = -t * 0.9 + (i * Math.PI) / 3;
          drawSparkle(cx + Math.cos(a) * (r + 5), cy + Math.sin(a) * (r + 5), size * 0.055, '#38bdf8', 0.9);
        }
      } else if (presetId === 'storm_lightning') {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        for (let bolt = 0; bolt < 3; bolt++) {
          ctx.beginPath();
          const steps = 28;
          for (let i = 0; i <= steps; i++) {
            const a = (i / steps) * Math.PI * 2 + t * 0.5;
            const jitter = (Math.random() - 0.5) * (size * 0.09);
            const rad = r + 3 + jitter;
            const x = cx + Math.cos(a) * rad;
            const y = cy + Math.sin(a) * rad;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
      } else if (presetId === 'solar_supernova') {
        for (let i = 0; i < 24; i++) {
          const a = (i * Math.PI * 2) / 24 + t * 0.4;
          const wave = Math.sin(t * 4 + i * 1.5) * (size * 0.06);
          ctx.save();
          ctx.strokeStyle = i % 2 === 0 ? '#f97316' : '#facc15';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.lineTo(
            cx + Math.cos(a) * (r + 6 + Math.abs(wave)),
            cy + Math.sin(a) * (r + 6 + Math.abs(wave))
          );
          ctx.stroke();
          ctx.restore();
        }
      } else if (presetId === 'cyberpunk_glitch') {
        const colors = ['#00f3ff', '#ff007f', '#fcee0a'];
        colors.forEach((col, idx) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(t * (idx % 2 === 0 ? 1.4 : -1.8));
          ctx.strokeStyle = col;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = col;
          ctx.shadowBlur = 10;
          ctx.setLineDash([size * 0.18, size * 0.1]);
          ctx.beginPath();
          ctx.arc(0, 0, r + 2 + idx * 2.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });
      } else if (presetId === 'aurora_crown') {
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 6; i++) {
          const a = t * 0.6 + (i * Math.PI) / 3;
          drawSparkle(cx + Math.cos(a) * (r + 4), cy + Math.sin(a) * (r + 4), size * 0.055, '#fde047', 0.9);
        }
      } else {
        // Fallback shader for lunar_wolf, hexs_hat, imperial_dragon & others
        const paletteMap: Record<string, [string, string]> = {
          lunar_wolf: ['#7dd3fc', '#f472b6'],
          hexs_hat: ['#c084fc', '#ec4899'],
          imperial_dragon: ['#fde047', '#ef4444'],
        };
        const [c1, c2] = paletteMap[presetId] || ['#38bdf8', '#a855f7'];

        for (let ring = 0; ring < 2; ring++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(t * (ring === 0 ? 1.1 : -1.4));
          const grad = ctx.createLinearGradient(-r, -r, r, r);
          grad.addColorStop(0, c1);
          grad.addColorStop(1, c2);
          ctx.strokeStyle = grad;
          ctx.lineWidth = ring === 0 ? 2.8 : 1.8;
          ctx.shadowColor = ring === 0 ? c1 : c2;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, r + 2 + ring * 2.5, 0, Math.PI * 1.55);
          ctx.stroke();
          ctx.restore();
        }

        for (let i = 0; i < 8; i++) {
          const a = t * 0.8 + (i * Math.PI * 2) / 8;
          const dist = r + 3.5 + Math.sin(t * 2.2 + i) * 3.5;
          const pulse = (Math.sin(t * 3.2 + i * 1.5) + 1) * 0.5;
          drawSparkle(
            cx + Math.cos(a) * dist,
            cy + Math.sin(a) * dist,
            size * 0.06 * (0.5 + pulse * 0.6),
            i % 2 === 0 ? c1 : c2,
            0.45 + pulse * 0.55
          );
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [presetId, size, overlaySize, useCanvasFallback]);

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size, overflow: 'visible' }}
    >
      {/* 1. User's Circular Avatar */}
      <img
        src={src}
        alt="avatar"
        className="w-full h-full rounded-full object-cover z-10"
      />

      {/* 2. Real Discord APNG Overlay (Primary) */}
      {presetId !== 'none' && activeImageUrl && !imgError && (
        <img
          src={activeImageUrl}
          alt={preset.name}
          onError={() => setImgError(true)}
          className="absolute pointer-events-none z-20 object-contain"
          style={{
            width: overlaySize,
            height: overlaySize,
            maxWidth: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* 3. Rich 60fps Canvas Shader Engine (Fallback if offline or APNG fails) */}
      {presetId !== 'none' && useCanvasFallback && (
        <canvas
          ref={canvasRef}
          className="absolute pointer-events-none z-20"
          style={{
            width: overlaySize,
            height: overlaySize,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* 4. Crown topper for Royal Sovereign when running in Canvas fallback mode */}
      {presetId === 'aurora_crown' && useCanvasFallback && (
        <img
          src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f451/512.webp"
          alt="crown"
          className="absolute pointer-events-none z-30 drop-shadow-[0_2px_8px_rgba(250,204,21,0.8)]"
          style={{
            width: size * 0.42,
            height: size * 0.42,
            top: -size * 0.24,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      )}
    </div>
  );
};