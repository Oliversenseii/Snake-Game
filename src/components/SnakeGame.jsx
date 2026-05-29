import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const SnakeGame = ({ onBack }) => {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [snakeLen, setSnakeLen] = useState(3);
  const [themeName, setThemeName] = useState('Classic 🐍');
  const [combo, setCombo] = useState(1);
  const [powerups, setPowerups] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(250);
  const [currentLevel, setCurrentLevel] = useState(1);

  const audioCtxRef = useRef(null);

  const playSound = (type) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      if (ctx.state === 'closed') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        return;
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case 'eat':
          osc.frequency.setValueAtTime(523.25, now);
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
          osc.start(now); osc.stop(now + 0.15);
          break;
        case 'gold':
          osc.frequency.setValueAtTime(659.25, now);
          osc.type = 'triangle';
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
          osc.start(now); osc.stop(now + 0.2);
          setTimeout(() => {
            if (ctx.state === 'closed') return;
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2); gain2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(783.99, now + 0.1);
            osc2.type = 'triangle';
            gain2.gain.setValueAtTime(0.15, now + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            osc2.start(now + 0.1); osc2.stop(now + 0.3);
          }, 100);
          break;
        case 'bomb':
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
          osc.start(now); osc.stop(now + 0.3);
          break;
        case 'powerup': {
          const freqs = [440, 554.37, 659.25, 880];
          freqs.forEach((freq, i) => {
            const delay = i * 70;
            setTimeout(() => {
              if (ctx.state === 'closed') return;
              const osc2 = ctx.createOscillator();
              const gain2 = ctx.createGain();
              osc2.connect(gain2); gain2.connect(ctx.destination);
              osc2.frequency.setValueAtTime(freq, ctx.currentTime);
              osc2.type = 'triangle';
              gain2.gain.setValueAtTime(0.1, ctx.currentTime);
              gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
              osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.15);
            }, delay);
          });
          break;
        }
        case 'enemy':
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
          osc.start(now); osc.stop(now + 0.3);
          break;
        case 'eatEnemy':
          osc.frequency.setValueAtTime(880, now);
          osc.type = 'square';
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
          osc.start(now); osc.stop(now + 0.2);
          setTimeout(() => {
            if (ctx.state === 'closed') return;
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2); gain2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(523.25, now + 0.15);
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.15, now + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
            osc2.start(now + 0.15); osc2.stop(now + 0.35);
          }, 150);
          break;
        case 'wall':
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
          osc.start(now); osc.stop(now + 0.25);
          break;
        case 'levelUp': {
          const lu = [523, 659, 784, 1047];
          lu.forEach((freq, i) => {
            setTimeout(() => {
              if (ctx.state === 'closed') return;
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g); g.connect(ctx.destination);
              o.frequency.setValueAtTime(freq, ctx.currentTime);
              o.type = 'square';
              g.gain.setValueAtTime(0.12, ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
              o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
            }, i * 100);
          });
          break;
        }
        case 'anaconda': {
          const roarFreqs = [80, 60, 40];
          roarFreqs.forEach((freq, i) => {
            setTimeout(() => {
              if (ctx.state === 'closed') return;
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g); g.connect(ctx.destination);
              o.frequency.setValueAtTime(freq, ctx.currentTime);
              o.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.5);
              o.type = 'sawtooth';
              g.gain.setValueAtTime(0.3, ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
              o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.6);
            }, i * 200);
          });
          break;
        }
        case 'gameOver':
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
          osc.start(now); osc.stop(now + 0.6);
          break;
        default:
          break;
      }
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const bestRef = useRef(0);

  useEffect(() => {
    const loadBestScore = async () => {
      let freshBest = 0;
      if (user) {
        const { data, error } = await supabase
          .from('scores')
          .select('high_score')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!error && data) freshBest = data.high_score;
      } else {
        const localBest = localStorage.getItem('snkBest5');
        if (localBest) freshBest = parseInt(localBest) || 0;
      }
      bestRef.current = freshBest;
      setBest(freshBest);
      if (gameRef.current) gameRef.current.best = freshBest;
    };

    loadBestScore();

    if (!audioCtxRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      } catch (e) {
        console.log('Web Audio API not supported');
      }
    }

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveScoreToDB = async (newScore) => {
    const currentBest = gameRef.current ? gameRef.current.best : bestRef.current;
    if (newScore > currentBest) {
      bestRef.current = newScore;
      if (gameRef.current) gameRef.current.best = newScore;
      setBest(newScore);
      localStorage.setItem('snkBest5', newScore);
      if (user) {
        const username =
          user.user_metadata?.username || user.email?.split('@')[0] || 'Player';
        const { error } = await supabase
          .from('scores')
          .upsert(
            { user_id: user.id, high_score: newScore, username, updated_at: new Date() },
            { onConflict: 'user_id' }
          );
        if (error) console.error('Error saving score:', error);
      }
    } else {
      localStorage.setItem('snkBest5', Math.max(newScore, currentBest));
    }
  };

  const CELL = 22;
  const MIN_SPEED = 80;
  const START_SPEED = 250;
  const SPEED_INCREASE = 15;
  const ENEMY_SPEED = 300;
  const ANACONDA_SPEED = 220;
  const COMBO_WINDOW = 2500;
  const ENEMY1_AT = 20, ENEMY2_AT = 40, ENEMY3_AT = 60;
  const ANACONDA_AT = 80;
  const BONUS_SPAWN_INTERVAL = 5000;
  const MAX_BONUS_FOODS = 2;

  const speedPercentage = Math.max(
    0,
    Math.min(100, ((START_SPEED - currentSpeed) / (START_SPEED - MIN_SPEED)) * 100)
  );

  const FOODS = {
    apple:  { emoji: '🍎', score: 1,  color: '#f87171', glow: 'rgba(248,113,113,0.55)', weight: 50, duration: 0,    vanish: 0     },
    speed:  { emoji: '⚡', score: 0,  color: '#fbbf24', glow: 'rgba(251,191,36,0.55)',  weight: 15, duration: 5000, vanish: 8000  },
    bomb:   { emoji: '💣', score: -3, color: '#6b7280', glow: 'rgba(107,114,128,0.55)', weight: 8,  duration: 0,    vanish: 10000 },
    gold:   { emoji: '🌟', score: 5,  color: '#fbbf24', glow: 'rgba(251,191,36,0.8)',   weight: 5,  duration: 0,    vanish: 5000  },
    poison: { emoji: '☢️', score: -2, color: '#84cc16', glow: 'rgba(132,204,22,0.6)',   weight: 12, duration: 0,    vanish: 7000  },
    powerup:{ emoji: '',   score: 0,  color: '#a78bfa', glow: 'rgba(167,139,250,0.6)',  weight: 10, duration: 0,    vanish: 8000  },
  };

  const POWERUP_TYPES = ['ghost', 'magnet', 'slow', 'shield'];
  const POWERUP_INFO = {
    ghost:  { emoji: '👻', label: 'Ghost',  color: '#a78bfa', dur: 5000 },
    magnet: { emoji: '🧲', label: 'Magnet', color: '#22d3ee', dur: 6000 },
    slow:   { emoji: '🐌', label: 'Slow',   color: '#60a5fa', dur: 5000 },
    shield: { emoji: '🛡', label: 'Shield', color: '#4ade80', dur: 0, oneHit: true },
  };

  const EVENTS = ['foodrain', 'portals'];

  // ─── MAP THEMES with background draw functions ─────────────────────────────
  const MAP_THEMES_POOL = [
    {
      score: 0, name: 'Classic 🐍', level: 1,
      bg: '#04080d', grid: '#07111a', wall: '#2d3f55', wallHighlight: 'rgba(255,255,255,0.07)',
      snakeBody: '#4ade80', snakeHead: '#bbf7d0', eye: '#0a1a10', tongue: '#f87171',
      stars: false, bubbles: false, particles: false,
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#04080d';
        ctx.fillRect(0, 0, W, H);
        // Subtle grass patches
        for (let i = 0; i < 20; i++) {
          const gx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
          const gy = (Math.cos(i * 97.3) * 0.5 + 0.5) * H;
          ctx.fillStyle = `rgba(20,60,20,${0.3 + Math.sin(i) * 0.1})`;
          ctx.beginPath();
          ctx.ellipse(gx, gy, 40 + Math.sin(i * 3) * 20, 30, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // Twinkling stars
        for (let i = 0; i < 40; i++) {
          const sx = (Math.sin(i * 73.1) * 0.5 + 0.5) * W;
          const sy = (Math.cos(i * 53.7) * 0.5 + 0.5) * H;
          const alpha = 0.3 + Math.sin(t * 0.002 + i) * 0.2;
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fillRect(sx, sy, 1, 1);
        }
      }
    },
    {
      score: 1, name: 'Neon City 🌃', level: 2,
      bg: '#0a0014', grid: '#12002a', wall: '#3d0066', wallHighlight: 'rgba(200,100,255,0.15)',
      snakeBody: '#c084fc', snakeHead: '#f0abfc', eye: '#1a0030', tongue: '#f472b6',
      stars: true, bubbles: false, particles: false, gridColor: '#1a0033',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#0a0014';
        ctx.fillRect(0, 0, W, H);
        // City skyline silhouette
        ctx.fillStyle = '#1a0030';
        const buildings = [
          [0, 0.55, 0.08, 0.45], [0.07, 0.45, 0.06, 0.55], [0.12, 0.6, 0.05, 0.4],
          [0.16, 0.5, 0.07, 0.5], [0.22, 0.4, 0.06, 0.6], [0.27, 0.55, 0.08, 0.45],
          [0.34, 0.45, 0.05, 0.55], [0.38, 0.35, 0.07, 0.65], [0.44, 0.5, 0.06, 0.5],
          [0.49, 0.4, 0.08, 0.6], [0.56, 0.55, 0.06, 0.45], [0.61, 0.42, 0.07, 0.58],
          [0.67, 0.38, 0.05, 0.62], [0.71, 0.52, 0.08, 0.48], [0.78, 0.45, 0.06, 0.55],
          [0.83, 0.6, 0.07, 0.4], [0.89, 0.5, 0.06, 0.5], [0.94, 0.42, 0.06, 0.58],
        ];
        buildings.forEach(([x, y, w, h]) => {
          ctx.fillRect(x * W, y * H, w * W, h * H);
        });
        // Neon window lights
        for (let i = 0; i < 60; i++) {
          const wx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
          const wy = 0.4 * H + (Math.cos(i * 97.3) * 0.5 + 0.5) * H * 0.55;
          const colors = ['rgba(192,132,252,', 'rgba(244,114,182,', 'rgba(251,191,36,', 'rgba(34,211,238,'];
          const c = colors[i % colors.length];
          const alpha = 0.4 + Math.sin(t * 0.003 + i * 1.3) * 0.3;
          ctx.fillStyle = `${c}${alpha})`;
          ctx.fillRect(wx, wy, 2, 3);
        }
      }
    },
    {
      score: 2, name: 'Deep Space 🚀', level: 3,
      bg: '#000008', grid: '#04040f', wall: '#1e3a5f', wallHighlight: 'rgba(100,180,255,0.1)',
      snakeBody: '#22d3ee', snakeHead: '#a5f3fc', eye: '#001a20', tongue: '#60a5fa',
      stars: true, bubbles: false, particles: false, gridColor: '#06060f',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#000008';
        ctx.fillRect(0, 0, W, H);
        // Nebula clouds
        const nebulas = [
          { x: 0.2, y: 0.3, r: 120, c: 'rgba(34,211,238,0.04)' },
          { x: 0.7, y: 0.6, r: 100, c: 'rgba(96,165,250,0.05)' },
          { x: 0.5, y: 0.8, r: 150, c: 'rgba(167,139,250,0.03)' },
        ];
        nebulas.forEach(n => {
          const grad = ctx.createRadialGradient(n.x * W, n.y * H, 0, n.x * W, n.y * H, n.r);
          grad.addColorStop(0, n.c);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        });
        // Stars with twinkle
        for (let i = 0; i < 80; i++) {
          const sx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
          const sy = (Math.cos(i * 97.3) * 0.5 + 0.5) * H;
          const alpha = 0.4 + Math.sin(t * 0.002 + i * 0.7) * 0.3;
          const size = i % 5 === 0 ? 2 : 1;
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fillRect(sx, sy, size, size);
        }
        // Distant planet
        ctx.fillStyle = 'rgba(30,58,95,0.6)';
        ctx.beginPath();
        ctx.arc(W * 0.85, H * 0.15, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(34,211,238,0.3)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(W * 0.85, H * 0.15, 60, 12, -0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    {
      score: 3, name: 'Deep Ocean 🌊', level: 4,
      bg: '#001525', grid: '#002035', wall: '#0c4a6e', wallHighlight: 'rgba(56,189,248,0.15)',
      snakeBody: '#34d399', snakeHead: '#a7f3d0', eye: '#001a10', tongue: '#2dd4bf',
      stars: false, bubbles: true, particles: false, gridColor: '#002030',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#001525';
        ctx.fillRect(0, 0, W, H);
        // Light rays from surface
        for (let i = 0; i < 5; i++) {
          const rx = (0.1 + i * 0.2) * W;
          const angle = Math.sin(t * 0.001 + i) * 0.1;
          ctx.save();
          ctx.translate(rx, 0);
          ctx.rotate(angle);
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, 'rgba(56,189,248,0.08)');
          grad.addColorStop(1, 'rgba(56,189,248,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(-15, 0, 30, H);
          ctx.restore();
        }
        // Coral at bottom
        const coralColors = ['#f87171', '#fb923c', '#fbbf24', '#f472b6'];
        for (let i = 0; i < 12; i++) {
          const cx = (0.05 + i * 0.08) * W;
          const ch = (0.1 + Math.sin(i * 2.3) * 0.06) * H;
          ctx.strokeStyle = coralColors[i % coralColors.length];
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.moveTo(cx, H);
          ctx.lineTo(cx, H - ch);
          ctx.moveTo(cx, H - ch * 0.5);
          ctx.lineTo(cx - 10, H - ch * 0.7);
          ctx.moveTo(cx, H - ch * 0.5);
          ctx.lineTo(cx + 10, H - ch * 0.7);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        // Bubbles
        for (let i = 0; i < 15; i++) {
          const bx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
          const by = ((((t * 0.0003 + i * 0.07)) % 1 + 1) % 1) * H;
          ctx.strokeStyle = 'rgba(56,189,248,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bx, by, 3 + (i % 3), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    },
    {
      score: 4, name: 'Lava Zone 🌋', level: 5,
      bg: '#150500', grid: '#200800', wall: '#7c2d12', wallHighlight: 'rgba(251,146,60,0.2)',
      snakeBody: '#fb923c', snakeHead: '#fed7aa', eye: '#1a0800', tongue: '#fbbf24',
      stars: false, bubbles: false, particles: true, gridColor: '#1a0600',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#150500';
        ctx.fillRect(0, 0, W, H);
        // Lava glow pools
        for (let i = 0; i < 5; i++) {
          const lx = (0.1 + i * 0.2) * W;
          const ly = (0.7 + Math.sin(i * 2.1) * 0.15) * H;
          const pulse = 0.3 + Math.sin(t * 0.002 + i * 1.3) * 0.15;
          const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 60 + pulse * 30);
          grad.addColorStop(0, `rgba(251,146,60,${pulse})`);
          grad.addColorStop(0.5, `rgba(220,38,38,${pulse * 0.5})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }
        // Volcano silhouette
        ctx.fillStyle = '#1a0800';
        ctx.beginPath();
        ctx.moveTo(W * 0.1, H);
        ctx.lineTo(W * 0.35, H * 0.3);
        ctx.lineTo(W * 0.42, H * 0.35);
        ctx.lineTo(W * 0.6, H);
        ctx.closePath();
        ctx.fill();
        // Lava drips
        for (let i = 0; i < 6; i++) {
          const dy = ((t * 0.0005 + i * 0.17) % 1) * H * 0.7;
          const dx = W * (0.33 + Math.sin(i) * 0.04);
          ctx.fillStyle = `rgba(239,68,68,${0.6 + Math.sin(t * 0.003 + i) * 0.2})`;
          ctx.beginPath();
          ctx.arc(dx, H * 0.35 + dy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      score: 5, name: 'CHAOS MODE 🌈', level: 6,
      bg: '#080008', grid: '#0f000f', wall: '#4a1d96', wallHighlight: 'rgba(167,139,250,0.2)',
      snakeBody: 'rainbow', snakeHead: '#fff', eye: '#000', tongue: '#f87171',
      stars: true, bubbles: true, particles: true, gridColor: '#0d000d',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#080008';
        ctx.fillRect(0, 0, W, H);
        // Psychedelic ripples
        for (let i = 0; i < 4; i++) {
          const rx = (0.2 + i * 0.2) * W;
          const ry = (0.3 + Math.sin(i * 1.57) * 0.2) * H;
          const r = 80 + Math.sin(t * 0.002 + i) * 30;
          const hue = (t * 0.1 + i * 90) % 360;
          const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, r);
          grad.addColorStop(0, `hsla(${hue},100%,60%,0.08)`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }
        // Shooting stars
        for (let i = 0; i < 5; i++) {
          const prog = ((t * 0.001 + i * 0.2) % 1);
          const sx = prog * W;
          const sy = (Math.sin(i * 2.3) * 0.5 + 0.5) * H * 0.8;
          const hue = (t * 0.2 + i * 72) % 360;
          ctx.strokeStyle = `hsla(${hue},100%,70%,${0.7 - prog * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - 30, sy + 10);
          ctx.stroke();
        }
      }
    },
    {
      score: 6, name: 'Frozen World ❄️', level: 7,
      bg: '#010d18', grid: '#031525', wall: '#164e63', wallHighlight: 'rgba(186,230,253,0.2)',
      snakeBody: '#7dd3fc', snakeHead: '#e0f2fe', eye: '#01161e', tongue: '#38bdf8',
      stars: true, bubbles: false, particles: false, gridColor: '#041a2e', mechanic: 'slippery',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#010d18';
        ctx.fillRect(0, 0, W, H);
        // Aurora borealis
        for (let i = 0; i < 3; i++) {
          const aw = W * 0.6;
          const ax = (0.1 + i * 0.25) * W;
          const ay = (0.1 + Math.sin(t * 0.001 + i * 1.2) * 0.05) * H;
          const grad = ctx.createLinearGradient(ax, ay, ax, ay + H * 0.35);
          grad.addColorStop(0, `rgba(125,211,252,${0.12 + Math.sin(t * 0.002 + i) * 0.05})`);
          grad.addColorStop(0.5, `rgba(52,211,153,${0.08})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.save();
          ctx.translate(ax + aw / 2, ay);
          ctx.scale(Math.sin(t * 0.0005 + i) * 0.3 + 1, 1);
          ctx.fillRect(-aw / 2, 0, aw, H * 0.35);
          ctx.restore();
        }
        // Snowflakes
        for (let i = 0; i < 25; i++) {
          const sx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
          const sy = ((t * 0.0002 + i * 0.04) % 1) * H;
          ctx.fillStyle = 'rgba(186,230,253,0.5)';
          ctx.font = '10px serif';
          ctx.fillText('❄', sx, sy);
        }
      }
    },
    {
      score: 7, name: 'Cyber Grid ⚡', level: 8,
      bg: '#000a0a', grid: '#001515', wall: '#134e4a', wallHighlight: 'rgba(45,212,191,0.25)',
      snakeBody: '#2dd4bf', snakeHead: '#ccfbf1', eye: '#001a18', tongue: '#f0abfc',
      stars: false, bubbles: false, particles: false, gridColor: '#001a1a', mechanic: 'electricBarriers',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#000a0a';
        ctx.fillRect(0, 0, W, H);
        // Scan lines
        for (let y = 0; y < H; y += 4) {
          ctx.fillStyle = 'rgba(45,212,191,0.02)';
          ctx.fillRect(0, y, W, 2);
        }
        // Circuit trace lines
        ctx.strokeStyle = 'rgba(45,212,191,0.07)';
        ctx.lineWidth = 1;
        const nodes = [[0.1,0.2],[0.4,0.15],[0.7,0.25],[0.2,0.7],[0.55,0.8],[0.85,0.6]];
        nodes.forEach((n, i) => {
          const next = nodes[(i + 1) % nodes.length];
          ctx.beginPath();
          ctx.moveTo(n[0] * W, n[1] * H);
          ctx.lineTo(next[0] * W, n[1] * H);
          ctx.lineTo(next[0] * W, next[1] * H);
          ctx.stroke();
          // Node dot
          const pulse = 0.3 + Math.sin(t * 0.003 + i * 1.3) * 0.2;
          ctx.fillStyle = `rgba(45,212,191,${pulse})`;
          ctx.beginPath();
          ctx.arc(n[0] * W, n[1] * H, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    },
    {
      score: 8, name: 'Toxic Area ☢️', level: 9,
      bg: '#030a00', grid: '#071200', wall: '#3f6212', wallHighlight: 'rgba(163,230,53,0.2)',
      snakeBody: '#84cc16', snakeHead: '#d9f99d', eye: '#0a1500', tongue: '#86efac',
      stars: false, bubbles: false, particles: false, gridColor: '#0a1600', mechanic: 'poisonFood',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#030a00';
        ctx.fillRect(0, 0, W, H);
        // Toxic sludge pools
        for (let i = 0; i < 4; i++) {
          const lx = (0.15 + i * 0.23) * W;
          const ly = (0.6 + Math.sin(i * 1.9) * 0.15) * H;
          const pulse = 0.2 + Math.sin(t * 0.002 + i) * 0.08;
          ctx.fillStyle = `rgba(132,204,22,${pulse})`;
          ctx.beginPath();
          ctx.ellipse(lx, ly, 50 + Math.sin(t * 0.001 + i) * 10, 20, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // Warning symbols
        for (let i = 0; i < 6; i++) {
          const wx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
          const wy = (Math.cos(i * 97.3) * 0.5 + 0.5) * H;
          const alpha = 0.06 + Math.sin(t * 0.003 + i) * 0.03;
          ctx.font = '30px serif';
          ctx.globalAlpha = alpha;
          ctx.fillText('☢', wx, wy);
          ctx.globalAlpha = 1;
        }
        // Rising toxic mist
        for (let i = 0; i < 20; i++) {
          const mx = (Math.sin(i * 73.1) * 0.5 + 0.5) * W;
          const my = H - ((t * 0.0001 + i * 0.05) % 1) * H * 0.5;
          ctx.fillStyle = `rgba(132,204,22,${0.03 + Math.sin(i) * 0.02})`;
          ctx.beginPath();
          ctx.arc(mx, my, 8 + Math.sin(i * 2.3) * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      score: 9, name: 'Storm Zone 🌪️', level: 10,
      bg: '#0d0d0d', grid: '#1a1a1a', wall: '#374151', wallHighlight: 'rgba(209,213,219,0.15)',
      snakeBody: '#d1d5db', snakeHead: '#f9fafb', eye: '#111827', tongue: '#60a5fa',
      stars: false, bubbles: false, particles: false, gridColor: '#1a1a1a',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, W, H);
        // Lightning flashes
        if (Math.sin(t * 0.008) > 0.95) {
          ctx.fillStyle = 'rgba(209,213,219,0.05)';
          ctx.fillRect(0, 0, W, H);
          // Lightning bolt
          const lx = W * (0.2 + Math.random() * 0.6);
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lx, 0);
          ctx.lineTo(lx - 15, H * 0.3);
          ctx.lineTo(lx + 10, H * 0.3);
          ctx.lineTo(lx - 20, H * 0.7);
          ctx.stroke();
        }
        // Rain
        for (let i = 0; i < 30; i++) {
          const rx = (Math.sin(i * 73.1) * 0.5 + 0.5) * W;
          const ry = ((t * 0.0008 + i * 0.033) % 1) * H;
          ctx.strokeStyle = 'rgba(148,163,184,0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 3, ry + 12);
          ctx.stroke();
        }
        // Storm clouds
        for (let i = 0; i < 4; i++) {
          const cx = (i * 0.28 + Math.sin(t * 0.0003 + i) * 0.05) * W;
          const cy = (0.05 + Math.cos(i * 0.7) * 0.03) * H;
          ctx.fillStyle = 'rgba(55,65,81,0.5)';
          ctx.beginPath();
          ctx.arc(cx, cy, 50, 0, Math.PI * 2);
          ctx.arc(cx + 35, cy - 10, 40, 0, Math.PI * 2);
          ctx.arc(cx + 70, cy, 45, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      score: 10, name: 'Void Realm 👁️', level: 11,
      bg: '#000000', grid: '#050505', wall: '#1c1917', wallHighlight: 'rgba(255,255,255,0.05)',
      snakeBody: '#a8a29e', snakeHead: '#fafaf9', eye: '#000', tongue: '#dc2626',
      stars: false, bubbles: false, particles: false, gridColor: '#080808', mechanic: 'glitch',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);
        // Void eye
        const ex = W / 2, ey = H / 2;
        const pulse = 0.15 + Math.sin(t * 0.002) * 0.05;
        const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, W * 0.4);
        grad.addColorStop(0, `rgba(220,38,38,${pulse})`);
        grad.addColorStop(0.3, `rgba(68,0,0,${pulse * 0.5})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        // Void tendrils
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + t * 0.001;
          ctx.strokeStyle = `rgba(168,162,158,${0.05 + Math.sin(t * 0.003 + i) * 0.03})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.bezierCurveTo(
            ex + Math.cos(angle + 0.5) * W * 0.3,
            ey + Math.sin(angle + 0.5) * H * 0.3,
            ex + Math.cos(angle - 0.5) * W * 0.4,
            ey + Math.sin(angle - 0.5) * H * 0.4,
            ex + Math.cos(angle) * W * 0.5,
            ey + Math.sin(angle) * H * 0.5
          );
          ctx.stroke();
        }
      }
    },
    {
      score: 11, name: 'Desert 🏜️', level: 12,
      bg: '#1c1206', grid: '#261a09', wall: '#78350f', wallHighlight: 'rgba(251,191,36,0.15)',
      snakeBody: '#d97706', snakeHead: '#fef3c7', eye: '#1c0f00', tongue: '#f87171',
      stars: false, bubbles: false, particles: false, gridColor: '#201509', mechanic: 'sandstorm',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#1c1206';
        ctx.fillRect(0, 0, W, H);
        // Desert dunes
        ctx.fillStyle = '#2d1a08';
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 20) {
          const y = H * 0.65 + Math.sin(x * 0.008 + t * 0.0003) * H * 0.08;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
        // Second dune layer
        ctx.fillStyle = '#3d2410';
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 20) {
          const y = H * 0.75 + Math.sin(x * 0.006 + t * 0.0002 + 1) * H * 0.06;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
        // Sun
        ctx.fillStyle = 'rgba(251,191,36,0.15)';
        ctx.beginPath();
        ctx.arc(W * 0.8, H * 0.15, 40, 0, Math.PI * 2);
        ctx.fill();
        // Heat haze particles
        for (let i = 0; i < 15; i++) {
          const hx = (Math.sin(i * 73.1) * 0.5 + 0.5) * W;
          const hy = H * 0.5 + ((t * 0.0003 + i * 0.07) % 1) * H * 0.3;
          ctx.fillStyle = `rgba(217,119,6,${0.05 + Math.sin(t * 0.005 + i) * 0.03})`;
          ctx.beginPath();
          ctx.arc(hx, hy, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      score: 12, name: 'Portal Lab 🌌', level: 13,
      bg: '#05001a', grid: '#0a0030', wall: '#2e1065', wallHighlight: 'rgba(139,92,246,0.2)',
      snakeBody: '#8b5cf6', snakeHead: '#ede9fe', eye: '#02000d', tongue: '#f472b6',
      stars: true, bubbles: false, particles: false, gridColor: '#080025', mechanic: 'manyPortals',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#05001a';
        ctx.fillRect(0, 0, W, H);
        // Portal energy rings
        for (let i = 0; i < 3; i++) {
          const px = (0.2 + i * 0.3) * W;
          const py = (0.3 + Math.sin(i * 2.1) * 0.2) * H;
          const r = 30 + Math.sin(t * 0.003 + i * 1.5) * 10;
          for (let ring = 0; ring < 3; ring++) {
            ctx.strokeStyle = `rgba(139,92,246,${0.15 - ring * 0.04})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, r + ring * 15, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        // Dimensional rifts
        ctx.strokeStyle = 'rgba(244,114,182,0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const rx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
          const ry = (Math.cos(i * 97.3) * 0.5 + 0.5) * H;
          const angle = t * 0.001 + i;
          ctx.beginPath();
          ctx.moveTo(rx + Math.cos(angle) * 20, ry + Math.sin(angle) * 20);
          ctx.lineTo(rx - Math.cos(angle) * 20, ry - Math.sin(angle) * 20);
          ctx.stroke();
        }
      }
    },
    {
      score: 13, name: 'Inferno 🔥', level: 14,
      bg: '#1a0000', grid: '#2a0000', wall: '#991b1b', wallHighlight: 'rgba(239,68,68,0.25)',
      snakeBody: '#ef4444', snakeHead: '#fecaca', eye: '#1a0000', tongue: '#fbbf24',
      stars: false, bubbles: false, particles: true, gridColor: '#200000', mechanic: 'movingWalls',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#1a0000';
        ctx.fillRect(0, 0, W, H);
        // Flame columns
        for (let i = 0; i < 6; i++) {
          const fx = (0.1 + i * 0.16) * W;
          const fh = (0.3 + Math.sin(t * 0.004 + i * 1.7) * 0.15) * H;
          const grad = ctx.createLinearGradient(fx, H, fx, H - fh);
          grad.addColorStop(0, `rgba(239,68,68,0.4)`);
          grad.addColorStop(0.5, `rgba(251,146,60,0.2)`);
          grad.addColorStop(1, 'rgba(251,191,36,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(fx - 15, H - fh, 30, fh);
        }
        // Ember particles
        for (let i = 0; i < 20; i++) {
          const ex = (Math.sin(i * 73.1) * 0.5 + 0.5) * W;
          const ey = H - ((t * 0.0006 + i * 0.05) % 1) * H * 0.8;
          ctx.fillStyle = `rgba(251,146,60,${0.5 + Math.sin(t * 0.01 + i) * 0.3})`;
          ctx.beginPath();
          ctx.arc(ex + Math.sin(t * 0.005 + i) * 10, ey, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      score: 14, name: 'Flooded Grid 🌊', level: 15,
      bg: '#000d1a', grid: '#001a33', wall: '#1e3a5f', wallHighlight: 'rgba(56,189,248,0.2)',
      snakeBody: '#38bdf8', snakeHead: '#bae6fd', eye: '#000d1a', tongue: '#34d399',
      stars: false, bubbles: true, particles: false, gridColor: '#001524', mechanic: 'risingWater',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#000d1a';
        ctx.fillRect(0, 0, W, H);
        // Deep water caustics
        for (let i = 0; i < 8; i++) {
          const cx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
          const cy = (Math.cos(i * 97.3) * 0.5 + 0.5) * H;
          const r = 40 + Math.sin(t * 0.002 + i) * 20;
          const alpha = 0.04 + Math.sin(t * 0.003 + i * 1.3) * 0.02;
          ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Surface shimmer at top
        const sGrad = ctx.createLinearGradient(0, 0, 0, H * 0.2);
        sGrad.addColorStop(0, 'rgba(56,189,248,0.06)');
        sGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sGrad;
        ctx.fillRect(0, 0, W, H * 0.2);
      }
    },
    {
      score: 15, name: '💀 NIGHTMARE', level: 16,
      bg: '#000000', grid: '#0a0000', wall: '#450a0a', wallHighlight: 'rgba(248,113,113,0.3)',
      snakeBody: '#dc2626', snakeHead: '#ffffff', eye: '#000', tongue: '#fbbf24',
      stars: false, bubbles: false, particles: true, gridColor: '#050000', mechanic: 'nightmare',
      drawBg: (ctx, W, H, t) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);
        // Blood moon
        const pulse = 0.2 + Math.sin(t * 0.002) * 0.08;
        ctx.fillStyle = `rgba(220,38,38,${pulse})`;
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.08, 50, 0, Math.PI * 2);
        ctx.fill();
        // Dripping blood effect
        for (let i = 0; i < 8; i++) {
          const dx = W * (0.25 + i * 0.07);
          const dh = ((t * 0.0004 + i * 0.125) % 1) * H * 0.5;
          ctx.fillStyle = `rgba(220,38,38,${0.3 + Math.sin(i) * 0.1})`;
          ctx.beginPath();
          ctx.moveTo(dx - 3, 0);
          ctx.lineTo(dx + 3, 0);
          ctx.lineTo(dx + 3, dh - 5);
          ctx.arc(dx, dh, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Skull pattern
        for (let i = 0; i < 5; i++) {
          const sx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
          const sy = (Math.cos(i * 97.3) * 0.5 + 0.5) * H;
          ctx.globalAlpha = 0.04 + Math.sin(t * 0.002 + i) * 0.02;
          ctx.font = '40px serif';
          ctx.fillStyle = '#dc2626';
          ctx.fillText('💀', sx, sy);
          ctx.globalAlpha = 1;
        }
      }
    },
  ];

  // ─── ANACONDA BOSS ─────────────────────────────────────────────────────────
  // She rules the 3 enemy snakes — bigger, faster, hunts you aggressively
  const ANACONDA_CONFIG = {
    name: 'anaconda',
    headColor: '#fde68a',
    bodyColor: '#b45309',
    accentColor: '#fbbf24',
    patternColor: '#92400e',
    label: '👑 QUEEN ANACONDA',
    startLength: 12,
    scoreReward: 15,
  };

  const ENEMY_CONFIGS = [
    { name: 'enemy1', headColor: '#fecaca', bodyColor: '#f87171', badge: 'badge-enemy1', label: '👾 Snake 1' },
    { name: 'enemy2', headColor: '#fbcfe8', bodyColor: '#f472b6', badge: 'badge-enemy2', label: '🌸 Snake 2' },
    { name: 'enemy3', headColor: '#fef08a', bodyColor: '#facc15', badge: 'badge-enemy3', label: '⚔️ Snake 3' },
  ];

  const gameRef = useRef(null);

  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const wk = (x, y) => `${x},${y}`;
  const rndInt = (n) => Math.floor(Math.random() * n);

  const initializeGame = (freshBest) => {
    const rest = shuffleArray(MAP_THEMES_POOL.slice(1));
    const MAP_THEMES = [MAP_THEMES_POOL[0], ...rest];
    MAP_THEMES.forEach((t, i) => { t._threshold = i * 10; });

    return {
      running: false,
      paused: false,
      score: 0,
      best: freshBest,
      snake: [],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      foods: [],
      walls: new Set(),
      speed: START_SPEED,
      loop: null,
      wallThreshold: 10,
      enemies: [],
      enemyLoop: null,
      anaconda: null,
      anacondaLoop: null,
      powerups: {},
      comboCount: 0,
      comboTimer: null,
      lastEatTime: 0,
      currentEvent: null,
      eventTimer: null,
      eventThreshold: 30,
      portals: [],
      darkMode: false,
      themeIdx: 0,
      rainbowHue: 0,
      bonusFoodTimers: [],
      bonusLoop: null,
      MAP_THEMES,
      electricBarriers: [],
      electricTimer: null,
      glitchActive: false,
      glitchTimer: null,
      sandstormAlpha: 0,
      sandstormTarget: 0,
      sandstormTimer: null,
      disappearedTiles: new Set(),
      disappearTimer: null,
      waterLevel: 0,
      waterRising: true,
      waterTimer: null,
      movingWallsTimer: null,
      bgTime: 0,
      bgAnimFrame: null,
      COLS: 0,
      ROWS: 0,
    };
  };

  const getTheme = () => {
    const themes = gameRef.current?.MAP_THEMES;
    if (!themes || !themes.length) return MAP_THEMES_POOL[0];
    let t = themes[0];
    for (const th of themes) {
      if (gameRef.current.score >= th._threshold) t = th;
    }
    return t;
  };

  const safePos = () => {
    const COLS = gameRef.current.COLS;
    const ROWS = gameRef.current.ROWS;
    for (let tries = 0; tries < 500; tries++) {
      const candidate = { x: rndInt(COLS), y: rndInt(ROWS) };
      const cx = candidate.x;
      const cy = candidate.y;
      const anacondaBlocked = gameRef.current.anaconda
        ? gameRef.current.anaconda.body.some(s => s.x === cx && s.y === cy)
        : false;
      const blocked =
        gameRef.current.walls.has(wk(cx, cy)) ||
        gameRef.current.snake.some(s => s.x === cx && s.y === cy) ||
        gameRef.current.foods.some(f => f.x === cx && f.y === cy) ||
        gameRef.current.enemies.some(e => e.body.some(s => s.x === cx && s.y === cy)) ||
        gameRef.current.disappearedTiles.has(wk(cx, cy)) ||
        anacondaBlocked;
      if (!blocked) return candidate;
    }
    return null;
  };

  const spawnSpecificFood = (type) => {
    const info = FOODS[type];
    if (!info) return;
    const pos = safePos();
    if (!pos) return;
    let food = { x: pos.x, y: pos.y, type, info: { ...info }, born: Date.now() };
    if (type === 'powerup') {
      const pu = POWERUP_TYPES[rndInt(POWERUP_TYPES.length)];
      food.pu = pu;
      food.info = { ...info, emoji: POWERUP_INFO[pu].emoji, color: POWERUP_INFO[pu].color };
    }
    gameRef.current.foods.push(food);
    if (type !== 'apple' && info.vanish) {
      const t = setTimeout(() => {
        gameRef.current.foods = gameRef.current.foods.filter(f => f !== food);
      }, info.vanish);
      gameRef.current.bonusFoodTimers.push(t);
    }
  };

  const ensureApple = () => {
    if (gameRef.current.foods.some(f => f.type === 'apple')) return;
    spawnSpecificFood('apple');
  };

  const spawnBonusFood = () => {
    if (!gameRef.current.running || gameRef.current.paused) return;
    const bonusCount = gameRef.current.foods.filter(f => f.type !== 'apple').length;
    if (bonusCount >= MAX_BONUS_FOODS) return;
    const th = getTheme();
    let types = Object.keys(FOODS).filter(t => t !== 'apple');
    if (th.mechanic === 'poisonFood') types = [...types, 'poison', 'poison'];
    const weights = types.map(t => FOODS[t].weight);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total, type = 'speed';
    for (let i = 0; i < types.length; i++) {
      r -= weights[i];
      if (r <= 0) { type = types[i]; break; }
    }
    spawnSpecificFood(type);
  };

  const addScore = async (pts, soundType = 'eat') => {
    const oldLevel = Math.floor(gameRef.current.score / 10);
    const newScoreValue = gameRef.current.score + pts;
    gameRef.current.score = Math.max(0, newScoreValue);
    setScore(gameRef.current.score);

    if (soundType === 'gold') playSound('gold');
    else if (soundType === 'bomb') playSound('bomb');
    else if (soundType === 'powerup') playSound('powerup');
    else if (soundType === 'enemy') playSound('eatEnemy');
    else playSound('eat');

    const newLevel = Math.floor(gameRef.current.score / 10);
    if (newLevel > oldLevel && newLevel > 0) {
      playSound('levelUp');
      setCurrentLevel(newLevel + 1);
      const newSpeed = Math.max(MIN_SPEED, gameRef.current.speed - SPEED_INCREASE);
      if (newSpeed !== gameRef.current.speed) {
        gameRef.current.speed = newSpeed;
        setCurrentSpeed(newSpeed);
        if (gameRef.current.loop) {
          clearInterval(gameRef.current.loop);
          gameRef.current.loop = setInterval(tick, gameRef.current.speed);
        }
      }
    }

    if (gameRef.current.score > gameRef.current.best) {
      await saveScoreToDB(gameRef.current.score);
    }

    setSnakeLen(gameRef.current.snake.length);
  };

  const updateHUD = () => {
    setScore(gameRef.current.score);
    setBest(gameRef.current.best);
    setSnakeLen(gameRef.current.snake.length);
    setCurrentSpeed(gameRef.current.speed);
    const theme = getTheme();
    setThemeName(theme.name);
    setCurrentLevel(Math.floor(gameRef.current.score / 10) + 1);
    setCombo(gameRef.current.comboCount || 1);
    const powerupList = Object.keys(gameRef.current.powerups).map(t => POWERUP_INFO[t]);
    setPowerups(powerupList);
  };

  const showEventBanner = (icon, title, desc) => {
    const banner = document.getElementById('event-banner');
    if (banner) {
      banner.innerHTML = `
        <div style="font-size:40px">${icon}</div>
        <div style="font-size:20px;font-weight:bold;color:#fbbf24">${title}</div>
        <div style="font-size:12px;color:#4a7a9b">${desc}</div>
      `;
      banner.style.display = 'flex';
      setTimeout(() => banner.style.display = 'none', 2200);
    }
  };

  const showLevelBanner = (level, themeName) => {
    const banner = document.getElementById('level-banner');
    if (banner) {
      banner.innerHTML = `
        <div style="font-size:13px;color:#4a7a9b;letter-spacing:2px">LEVEL ${level}</div>
        <div style="font-size:22px;font-weight:bold;color:#fbbf24;margin:4px 0">${themeName}</div>
        <div style="font-size:11px;color:#22d3ee">New map unlocked!</div>
      `;
      banner.style.display = 'flex';
      setTimeout(() => banner.style.display = 'none', 2500);
    }
  };

  const triggerRandomEvent = () => {
    const ev = EVENTS[rndInt(EVENTS.length)];
    gameRef.current.currentEvent = ev;

    if (ev === 'foodrain') {
      showEventBanner('🌧', 'FOOD RAIN!', '8 apples incoming!');
      let count = 0;
      const ri = setInterval(() => {
        spawnSpecificFood('apple');
        count++;
        if (count >= 8) {
          clearInterval(ri);
          gameRef.current.currentEvent = null;
        }
      }, 350);
    } else if (ev === 'portals') {
      showEventBanner('🌀', 'PORTALS!', 'Teleport portals appeared!');
      gameRef.current.portals = [];
      for (let i = 0; i < 2; i++) {
        const a = safePos(), b = safePos();
        if (a && b) gameRef.current.portals.push({ a, b });
      }
      setTimeout(() => {
        if (gameRef.current) {
          gameRef.current.portals = [];
          gameRef.current.currentEvent = null;
        }
      }, 12000);
    }
  };

  const rebuildElectricBarriers = () => {
    gameRef.current.electricBarriers = [];
    const count = 2 + rndInt(3);
    for (let i = 0; i < count; i++) {
      const horiz = Math.random() > 0.5;
      const len = 2 + rndInt(3);
      const sx = rndInt(gameRef.current.COLS - len - 2) + 1;
      const sy = rndInt(gameRef.current.ROWS - 3) + 1;
      const cells = [];
      for (let j = 0; j < len; j++) {
        cells.push({ x: horiz ? sx + j : sx, y: horiz ? sy : sy + j });
      }
      gameRef.current.electricBarriers.push({ cells, active: Math.random() > 0.5 });
    }
    gameRef.current.electricBarriers.forEach(b => b.active = !b.active);
  };

  const initMechanic = (th) => {
    if (gameRef.current.electricTimer) clearInterval(gameRef.current.electricTimer);
    if (gameRef.current.glitchTimer) clearTimeout(gameRef.current.glitchTimer);
    if (gameRef.current.sandstormTimer) clearInterval(gameRef.current.sandstormTimer);
    if (gameRef.current.disappearTimer) clearInterval(gameRef.current.disappearTimer);
    if (gameRef.current.waterTimer) clearInterval(gameRef.current.waterTimer);
    if (gameRef.current.movingWallsTimer) clearInterval(gameRef.current.movingWallsTimer);

    gameRef.current.electricBarriers = [];
    gameRef.current.glitchActive = false;
    gameRef.current.sandstormAlpha = 0;
    gameRef.current.sandstormTarget = 0;
    gameRef.current.waterLevel = 0;
    gameRef.current.waterRising = true;

    if (!th.mechanic) return;

    if (th.mechanic === 'electricBarriers') {
      rebuildElectricBarriers();
      gameRef.current.electricTimer = setInterval(() => rebuildElectricBarriers(), 2500);
    }

    if (th.mechanic === 'glitch') {
      const scheduleGlitch = () => {
        if (!gameRef.current.running) return;
        gameRef.current.glitchTimer = setTimeout(() => {
          gameRef.current.glitchActive = true;
          setTimeout(() => {
            gameRef.current.glitchActive = false;
            scheduleGlitch();
          }, 200 + rndInt(400));
        }, 1000 + rndInt(3000));
      };
      scheduleGlitch();
    }

    if (th.mechanic === 'sandstorm') {
      gameRef.current.sandstormTimer = setInterval(() => {
        gameRef.current.sandstormTarget = gameRef.current.sandstormTarget > 0 ? 0 : 0.6 + Math.random() * 0.25;
      }, 4000);
    }

    if (th.mechanic === 'disappearingTiles') {
      gameRef.current.disappearTimer = setInterval(() => {
        if (!gameRef.current.running || gameRef.current.paused) return;
        if (gameRef.current.disappearedTiles.size < gameRef.current.COLS * gameRef.current.ROWS * 0.08) {
          const pos = safePos();
          if (pos && !gameRef.current.snake.some(s => s.x === pos.x && s.y === pos.y)) {
            gameRef.current.disappearedTiles.add(wk(pos.x, pos.y));
            setTimeout(() => gameRef.current.disappearedTiles.delete(wk(pos.x, pos.y)), 8000);
          }
        }
      }, 800);
    }

    if (th.mechanic === 'risingWater') {
      const TIDE_MAX = () => Math.floor(gameRef.current.ROWS * 0.5);
      gameRef.current.waterLevel = 0;
      gameRef.current.waterRising = true;
      gameRef.current.waterTimer = setInterval(() => {
        if (!gameRef.current.running || gameRef.current.paused) return;
        if (gameRef.current.waterRising) {
          gameRef.current.waterLevel = Math.min(gameRef.current.waterLevel + 1, TIDE_MAX());
          if (gameRef.current.waterLevel === TIDE_MAX()) {
            showEventBanner('🌊', 'HIGH TIDE!', 'The tide is receding...');
            gameRef.current.waterRising = false;
          }
        } else {
          gameRef.current.waterLevel = Math.max(gameRef.current.waterLevel - 1, 0);
          if (gameRef.current.waterLevel === 0) {
            showEventBanner('🌊', 'LOW TIDE!', 'The tide is coming back...');
            gameRef.current.waterRising = true;
          }
        }
      }, 2500);
    }

    if (th.mechanic === 'movingWalls') {
      gameRef.current.movingWallsTimer = setInterval(() => {
        if (!gameRef.current.running || gameRef.current.paused) return;
        const keys = [...gameRef.current.walls];
        const sample = keys.slice(0, Math.min(4, keys.length));
        sample.forEach(k => {
          const [wx, wy] = k.split(',').map(Number);
          gameRef.current.walls.delete(k);
          const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
          const d = dirs[rndInt(dirs.length)];
          const nx = (wx + d.x + gameRef.current.COLS) % gameRef.current.COLS;
          const ny = (wy + d.y + gameRef.current.ROWS) % gameRef.current.ROWS;
          if (
            !gameRef.current.snake.some(s => s.x === nx && s.y === ny) &&
            !gameRef.current.foods.some(f => f.x === nx && f.y === ny)
          ) {
            gameRef.current.walls.add(wk(nx, ny));
          } else {
            gameRef.current.walls.add(k);
          }
        });
      }, 2000);
    }

    if (th.mechanic === 'manyPortals') {
      gameRef.current.portals = [];
      for (let i = 0; i < 3; i++) {
        const a = safePos(), b = safePos();
        if (a && b) gameRef.current.portals.push({ a, b });
      }
      gameRef.current.movingWallsTimer = setInterval(() => {
        if (!gameRef.current.running || gameRef.current.paused) return;
        gameRef.current.portals = [];
        for (let i = 0; i < 3; i++) {
          const a = safePos(), b = safePos();
          if (a && b) gameRef.current.portals.push({ a, b });
        }
      }, 15000);
    }

    if (th.mechanic === 'nightmare') {
      gameRef.current.portals = [];
      const a = safePos(), b = safePos();
      if (a && b) gameRef.current.portals.push({ a, b });
      gameRef.current.glitchActive = false;
      const nightmareGlitch = () => {
        if (!gameRef.current.running) return;
        gameRef.current.glitchTimer = setTimeout(() => {
          gameRef.current.glitchActive = true;
          setTimeout(() => {
            gameRef.current.glitchActive = false;
            nightmareGlitch();
          }, 150 + rndInt(300));
        }, 500 + rndInt(1500));
      };
      nightmareGlitch();
    }
  };

  const addWalls = () => {
    let added = 0, attempts = 0;
    const COLS = gameRef.current.COLS;
    const ROWS = gameRef.current.ROWS;

    while (added < 4 && attempts < 500) {
      attempts++;
      const horiz = Math.random() > 0.5;
      const len = 3 + rndInt(3);
      const sx = rndInt(COLS - len - 2) + 1;
      const sy = rndInt(ROWS - 2) + 1;
      let ok = true;
      const cells = [];

      for (let i = 0; i < len; i++) {
        const wx = horiz ? sx + i : sx;
        const wy = horiz ? sy : sy + i;
        if (
          gameRef.current.walls.has(wk(wx, wy)) ||
          gameRef.current.snake.some(s => s.x === wx && s.y === wy) ||
          gameRef.current.foods.some(f => f.x === wx && f.y === wy)
        ) {
          ok = false;
          break;
        }
        cells.push([wx, wy]);
      }

      if (ok) {
        cells.forEach(([wx, wy]) => gameRef.current.walls.add(wk(wx, wy)));
        added++;
        playSound('wall');
      }
    }
  };

  const spawnEnemy = (idx) => {
    if (gameRef.current.enemies.length > idx) return;
    const cfg = ENEMY_CONFIGS[idx];
    const COLS = gameRef.current.COLS;
    const ROWS = gameRef.current.ROWS;
    let ex = 0, ey = 0;
    for (let tries = 0; tries < 500; tries++) {
      const cx = rndInt(COLS);
      const cy = rndInt(ROWS);
      const blocked =
        gameRef.current.walls.has(wk(cx, cy)) ||
        gameRef.current.snake.some(s => Math.abs(s.x - cx) < 8 && Math.abs(s.y - cy) < 8) ||
        gameRef.current.enemies.some(e => e.body.some(s => s.x === cx && s.y === cy));
      if (!blocked) { ex = cx; ey = cy; break; }
    }
    const d = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }][rndInt(4)];
    const enemy = {
      idx, cfg,
      body: [
        { x: ex, y: ey },
        { x: (ex - d.x + COLS) % COLS, y: (ey - d.y + ROWS) % ROWS },
        { x: (ex - d.x * 2 + COLS) % COLS, y: (ey - d.y * 2 + ROWS) % ROWS },
      ],
      dir: { ...d }, active: true,
      personality: idx === 0 ? 'aggressive' : idx === 1 ? 'random' : 'patrol',
    };
    gameRef.current.enemies.push(enemy);
    showEventBanner(
      idx === 0 ? '👾' : idx === 1 ? '🌸' : '⚔️',
      idx === 0 ? 'ENEMY SNAKE!' : idx === 1 ? '2ND SNAKE!' : '3RD SNAKE!',
      idx === 0 ? 'Eat the head to win!' : idx === 1 ? 'Two enemies now!' : 'THREE enemies! 💀'
    );
    playSound('enemy');
    if (!gameRef.current.enemyLoop) {
      gameRef.current.enemyLoop = setInterval(tickEnemies, ENEMY_SPEED);
    }
  };

  // ─── ANACONDA SPAWN & TICK ──────────────────────────────────────────────────
  const spawnAnaconda = () => {
    if (gameRef.current.anaconda) return;
    const COLS = gameRef.current.COLS;
    const ROWS = gameRef.current.ROWS;
    let sx = 0, sy = 0;
    for (let tries = 0; tries < 500; tries++) {
      const cx = rndInt(COLS);
      const cy = rndInt(ROWS);
      const blocked =
        gameRef.current.walls.has(wk(cx, cy)) ||
        gameRef.current.snake.some(s => Math.abs(s.x - cx) < 10 && Math.abs(s.y - cy) < 10) ||
        gameRef.current.enemies.some(e => e.body.some(s => s.x === cx && s.y === cy));
      if (!blocked) { sx = cx; sy = cy; break; }
    }

    const d = { x: 1, y: 0 };
    const body = [];
    for (let i = 0; i < ANACONDA_CONFIG.startLength; i++) {
      body.push({
        x: (sx - d.x * i + COLS * 2) % COLS,
        y: (sy - d.y * i + ROWS * 2) % ROWS,
      });
    }

    gameRef.current.anaconda = {
      body,
      dir: { ...d },
      active: true,
      health: 3,           // takes 3 hits to die
      enraged: false,
      enrageTimer: null,
      queenOfEnemies: true,
    };

    // Make all existing enemies flee / protect anaconda (behavior shift)
    gameRef.current.enemies.forEach(e => {
      e.personality = 'escort'; // escorts queen
    });

    showEventBanner('👑', '🐍 QUEEN ANACONDA!', 'She commands the horde! 3 hits to defeat!');
    playSound('anaconda');

    if (!gameRef.current.anacondaLoop) {
      gameRef.current.anacondaLoop = setInterval(tickAnaconda, ANACONDA_SPEED);
    }
  };

  const tickAnaconda = () => {
    if (!gameRef.current.running || gameRef.current.paused) return;
    const ana = gameRef.current.anaconda;
    if (!ana || !ana.active) return;

    const COLS = gameRef.current.COLS;
    const ROWS = gameRef.current.ROWS;
    const head = ana.body[0];
    const target = gameRef.current.snake[0]; // Always hunts player

    const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
    let best = null;
    let bestScore = -Infinity;

    for (const d of dirs) {
      if (d.x === -ana.dir.x && d.y === -ana.dir.y) continue;
      const nx = (head.x + d.x + COLS) % COLS;
      const ny = (head.y + d.y + ROWS) % ROWS;
      if (gameRef.current.walls.has(wk(nx, ny))) continue;
      if (ana.body.slice(1).some(s => s.x === nx && s.y === ny)) continue;

      // Ana is smart — avoids enemies too unless enraged
      if (!ana.enraged && gameRef.current.enemies.some(e => e.body[0].x === nx && e.body[0].y === ny)) continue;

      const dist = Math.abs(nx - target.x) + Math.abs(ny - target.y);
      let sc = -dist;
      if (ana.enraged) sc += Math.random() * 3; // random factor when enraged
      if (sc > bestScore) { bestScore = sc; best = d; }
    }

    if (!best) {
      // Fallback: pick any valid direction
      for (const d of dirs) {
        const nx = (head.x + d.x + COLS) % COLS;
        const ny = (head.y + d.y + ROWS) % ROWS;
        if (!gameRef.current.walls.has(wk(nx, ny)) && !ana.body.slice(1).some(s => s.x === nx && s.y === ny)) {
          best = d;
          break;
        }
      }
    }
    if (!best) return;

    ana.dir = best;
    const nh = {
      x: (head.x + ana.dir.x + COLS) % COLS,
      y: (head.y + ana.dir.y + ROWS) % ROWS,
    };

    // Did she reach the player's head?
    if (nh.x === target.x && nh.y === target.y) {
      if (gameRef.current.powerups.shield) {
        delete gameRef.current.powerups.shield;
        updateHUD();
        return;
      }
      gameOver();
      return;
    }

    // Did she hit player's body?
    if (gameRef.current.snake.slice(1).some(s => s.x === nh.x && s.y === nh.y)) return;

    ana.body.unshift(nh);
    // Anaconda grows when eating food
    const fi = gameRef.current.foods.findIndex(f => f.x === nh.x && f.y === nh.y);
    if (fi >= 0) {
      gameRef.current.foods.splice(fi, 1);
      ensureApple();
      // Grows 2 extra segments when eating
      ana.body.push({ ...ana.body[ana.body.length - 1] });
      ana.body.push({ ...ana.body[ana.body.length - 1] });
    } else {
      ana.body.pop();
    }

    renderCanvas();
  };

  const hitAnaconda = () => {
    const ana = gameRef.current.anaconda;
    if (!ana || !ana.active) return;

    ana.health -= 1;

    if (ana.health <= 0) {
      // Anaconda dies
      ana.active = false;
      addScore(ANACONDA_CONFIG.scoreReward, 'enemy');
      floatText('👑 QUEEN DEFEATED! +' + ANACONDA_CONFIG.scoreReward + '!', ana.body[0], '#fbbf24');
      showEventBanner('🏆', 'QUEEN DEFEATED!', `+${ANACONDA_CONFIG.scoreReward} points!`);

      // Enemies go berserk without their queen
      gameRef.current.enemies.forEach(e => {
        e.personality = 'aggressive';
      });

      // Reward: grow player snake
      for (let i = 0; i < 5; i++) {
        gameRef.current.snake.push({ ...gameRef.current.snake[gameRef.current.snake.length - 1] });
      }

      // Anaconda respawns after 15 seconds if score still above threshold
      setTimeout(() => {
        if (!gameRef.current.running) return;
        if (gameRef.current.score >= ANACONDA_AT) {
          gameRef.current.anaconda = null;
          spawnAnaconda();
        }
      }, 15000);
    } else {
      // Phase shift — enrage
      ana.enraged = true;
      floatText(`👑 ${ana.health} HP LEFT!`, ana.body[0], '#f87171');
      showEventBanner('😡', 'ANACONDA ENRAGED!', `${ana.health} hits remaining!`);
      if (ana.enrageTimer) clearTimeout(ana.enrageTimer);
      ana.enrageTimer = setTimeout(() => {
        if (ana) ana.enraged = false;
      }, 4000);
    }
  };

  const tickEnemies = () => {
    if (!gameRef.current.running || gameRef.current.paused) return;
    const COLS = gameRef.current.COLS;
    const ROWS = gameRef.current.ROWS;

    gameRef.current.enemies.forEach(enemy => {
      if (!enemy.active) return;
      const head = enemy.body[0];
      let target = null;
      let bestDist = Infinity;

      if (enemy.personality === 'aggressive') {
        target = gameRef.current.snake[0];
      } else if (enemy.personality === 'escort') {
        // Escort anaconda — orbit her head
        target = gameRef.current.anaconda?.body[0] || gameRef.current.snake[0];
      } else {
        gameRef.current.foods.forEach(f => {
          const d = Math.abs(f.x - head.x) + Math.abs(f.y - head.y);
          if (d < bestDist) { bestDist = d; target = f; }
        });
      }

      const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
      let best = null;
      let bestScore = -Infinity;

      for (const d of dirs) {
        if (d.x === -enemy.dir.x && d.y === -enemy.dir.y) continue;
        const nx = (head.x + d.x + COLS) % COLS;
        const ny = (head.y + d.y + ROWS) % ROWS;
        if (gameRef.current.walls.has(wk(nx, ny))) continue;
        if (gameRef.current.disappearedTiles.has(wk(nx, ny))) continue;
        if (enemy.body.some(s => s.x === nx && s.y === ny)) continue;
        if (gameRef.current.enemies.some(e => e !== enemy && e.body.some(s => s.x === nx && s.y === ny))) continue;

        let sc = 0;
        if (target) sc = -(Math.abs(nx - target.x) + Math.abs(ny - target.y));
        if (enemy.personality === 'random') sc += (Math.random() - 0.5) * 8;
        else if (enemy.personality === 'patrol') sc += (Math.random() - 0.5) * 4;
        else if (enemy.personality === 'escort') sc += (Math.random() - 0.5) * 3;

        if (sc > bestScore) { bestScore = sc; best = d; }
      }

      if (!best) return;
      enemy.dir = best;
      const nh = {
        x: (head.x + enemy.dir.x + COLS) % COLS,
        y: (head.y + enemy.dir.y + ROWS) % ROWS,
      };

      if (gameRef.current.snake[0].x === nh.x && gameRef.current.snake[0].y === nh.y) {
        if (gameRef.current.powerups.shield) {
          delete gameRef.current.powerups.shield;
          updateHUD();
          return;
        }
        gameOver();
        return;
      }

      const bodyHit = gameRef.current.snake.slice(1).some(s => s.x === nh.x && s.y === nh.y);
      if (bodyHit) return;

      enemy.body.unshift(nh);
      const fi = gameRef.current.foods.findIndex(f => f.x === nh.x && f.y === nh.y);
      if (fi >= 0) {
        gameRef.current.foods.splice(fi, 1);
        ensureApple();
      } else {
        enemy.body.pop();
      }
    });
    renderCanvas();
  };

  const registerCombo = () => {
    const now = Date.now();
    if (now - gameRef.current.lastEatTime < COMBO_WINDOW) {
      gameRef.current.comboCount = Math.min(gameRef.current.comboCount + 1, 8);
    } else {
      gameRef.current.comboCount = 1;
    }
    gameRef.current.lastEatTime = now;
    if (gameRef.current.comboTimer) clearTimeout(gameRef.current.comboTimer);
    if (gameRef.current.comboCount >= 2) {
      gameRef.current.comboTimer = setTimeout(() => {
        gameRef.current.comboCount = 0;
        updateHUD();
      }, COMBO_WINDOW);
    }
    updateHUD();
    return gameRef.current.comboCount >= 2 ? gameRef.current.comboCount : 1;
  };

  const activatePowerup = (type) => {
    const info = POWERUP_INFO[type];
    gameRef.current.powerups[type] = info.oneHit ? 'shield' : Date.now() + info.dur;
    updateHUD();
    playSound('powerup');

    if (type === 'slow') {
      const slowSpeed = Math.min(gameRef.current.speed * 2, 400);
      clearInterval(gameRef.current.loop);
      gameRef.current.loop = setInterval(tick, slowSpeed);
      setCurrentSpeed(slowSpeed);
      setTimeout(() => {
        if (gameRef.current.running) {
          clearInterval(gameRef.current.loop);
          gameRef.current.loop = setInterval(tick, gameRef.current.speed);
          setCurrentSpeed(gameRef.current.speed);
        }
      }, info.dur);
    }

    if (type !== 'slow' && !info.oneHit) {
      setTimeout(() => {
        delete gameRef.current.powerups[type];
        updateHUD();
      }, info.dur);
    }
  };

  const clearAllTimers = () => {
    if (!gameRef.current) return;
    if (gameRef.current.loop) { clearInterval(gameRef.current.loop); gameRef.current.loop = null; }
    if (gameRef.current.enemyLoop) { clearInterval(gameRef.current.enemyLoop); gameRef.current.enemyLoop = null; }
    if (gameRef.current.anacondaLoop) { clearInterval(gameRef.current.anacondaLoop); gameRef.current.anacondaLoop = null; }
    if (gameRef.current.bonusLoop) { clearInterval(gameRef.current.bonusLoop); gameRef.current.bonusLoop = null; }
    if (gameRef.current.electricTimer) { clearInterval(gameRef.current.electricTimer); gameRef.current.electricTimer = null; }
    if (gameRef.current.glitchTimer) { clearTimeout(gameRef.current.glitchTimer); gameRef.current.glitchTimer = null; }
    if (gameRef.current.sandstormTimer) { clearInterval(gameRef.current.sandstormTimer); gameRef.current.sandstormTimer = null; }
    if (gameRef.current.disappearTimer) { clearInterval(gameRef.current.disappearTimer); gameRef.current.disappearTimer = null; }
    if (gameRef.current.waterTimer) { clearInterval(gameRef.current.waterTimer); gameRef.current.waterTimer = null; }
    if (gameRef.current.movingWallsTimer) { clearInterval(gameRef.current.movingWallsTimer); gameRef.current.movingWallsTimer = null; }
    if (gameRef.current.comboTimer) { clearTimeout(gameRef.current.comboTimer); gameRef.current.comboTimer = null; }
    if (gameRef.current.bgAnimFrame) { cancelAnimationFrame(gameRef.current.bgAnimFrame); gameRef.current.bgAnimFrame = null; }
    if (gameRef.current.bonusFoodTimers) {
      gameRef.current.bonusFoodTimers.forEach(t => clearTimeout(t));
      gameRef.current.bonusFoodTimers = [];
    }
  };

  const gameOver = () => {
    gameRef.current.running = false;
    clearAllTimers();
    playSound('gameOver');
    const overlay = document.getElementById('gameOverlay');
    if (overlay) overlay.style.display = 'flex';
  };

  const floatText = (text, pos, color) => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = (pos.x * CELL + CELL / 2) + 'px';
    el.style.top = (pos.y * CELL) + 'px';
    el.style.color = color;
    el.style.fontSize = '18px';
    el.style.fontWeight = 'bold';
    el.style.fontFamily = 'monospace';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '20';
    el.style.animation = 'floatUp 1s ease forwards';
    container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  };

  // ─── BACKGROUND ANIMATION LOOP ─────────────────────────────────────────────
  const animateBackground = () => {
    if (!gameRef.current?.running) return;
    const bg = bgCanvasRef.current;
    if (!bg) return;
    const ctx = bg.getContext('2d');
    const th = getTheme();
    gameRef.current.bgTime += 16;
    if (th.drawBg) {
      th.drawBg(ctx, bg.width, bg.height, gameRef.current.bgTime);
    }
    gameRef.current.bgAnimFrame = requestAnimationFrame(animateBackground);
  };

  const tick = () => {
    if (!gameRef.current.running || gameRef.current.paused) return;

    const COLS = gameRef.current.COLS;
    const ROWS = gameRef.current.ROWS;

    gameRef.current.dir = gameRef.current.nextDir;
    const dx = gameRef.current.dir.x;
    const dy = gameRef.current.dir.y;

    const head = gameRef.current.snake[0];
    const newHead = {
      x: (head.x + dx + COLS) % COLS,
      y: (head.y + dy + ROWS) % ROWS,
    };

    if (gameRef.current.powerups.magnet && Date.now() < gameRef.current.powerups.magnet) {
      gameRef.current.foods.forEach(f => {
        const dist = Math.abs(f.x - newHead.x) + Math.abs(f.y - newHead.y);
        if (dist <= 4 && dist > 0) {
          const mx = f.x + (newHead.x - f.x > 0 ? 1 : newHead.x - f.x < 0 ? -1 : 0);
          const my = f.y + (newHead.y - f.y > 0 ? 1 : newHead.y - f.y < 0 ? -1 : 0);
          if (!gameRef.current.walls.has(wk(mx, my)) && !gameRef.current.snake.some(s => s.x === mx && s.y === my)) {
            f.x = mx;
            f.y = my;
          }
        }
      });
    }

    const hasGhost = gameRef.current.powerups.ghost && Date.now() < gameRef.current.powerups.ghost;

    if (!hasGhost && gameRef.current.walls.has(wk(newHead.x, newHead.y))) {
      if (gameRef.current.powerups.shield) {
        delete gameRef.current.powerups.shield;
        updateHUD();
      } else {
        gameOver();
        return;
      }
    }

    if (!hasGhost && gameRef.current.disappearedTiles.has(wk(newHead.x, newHead.y))) {
      if (gameRef.current.powerups.shield) {
        delete gameRef.current.powerups.shield;
        updateHUD();
      } else {
        gameOver();
        return;
      }
    }

    if (!hasGhost) {
      for (const barrier of gameRef.current.electricBarriers) {
        if (barrier.active && barrier.cells.some(c => c.x === newHead.x && c.y === newHead.y)) {
          if (gameRef.current.powerups.shield) {
            delete gameRef.current.powerups.shield;
            updateHUD();
            break;
          }
          gameOver();
          return;
        }
      }
    }

    if (gameRef.current.waterLevel > 0 && newHead.y >= ROWS - gameRef.current.waterLevel) {
      if (gameRef.current.powerups.shield) {
        delete gameRef.current.powerups.shield;
        updateHUD();
      } else {
        gameOver();
        return;
      }
    }

    if (gameRef.current.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      if (gameRef.current.powerups.shield) {
        delete gameRef.current.powerups.shield;
        updateHUD();
      } else {
        gameOver();
        return;
      }
    }

    // ── Check anaconda collision ────────────────────────────────────────────
    const ana = gameRef.current.anaconda;
    if (ana && ana.active) {
      // Hit anaconda's head = damage it
      if (ana.body[0].x === newHead.x && ana.body[0].y === newHead.y) {
        hitAnaconda();
        // Don't die — we're attacking her
      } else if (ana.body.slice(1).some(s => s.x === newHead.x && s.y === newHead.y)) {
        // Hit her body = player dies (unless shield)
        if (gameRef.current.powerups.shield) {
          delete gameRef.current.powerups.shield;
          updateHUD();
        } else {
          gameOver();
          return;
        }
      }
    }

    for (const enemy of gameRef.current.enemies) {
      if (!enemy.active) continue;

      if (enemy.body[0].x === newHead.x && enemy.body[0].y === newHead.y) {
        const gainLen = enemy.body.length;
        addScore(Math.max(3, Math.floor(gainLen / 2)), 'enemy');
        floatText('🐍 +' + Math.max(3, Math.floor(gainLen / 2)) + '!', newHead, '#fbbf24');
        enemy.active = false;
        for (let i = 0; i < 3; i++) {
          gameRef.current.snake.push({ ...gameRef.current.snake[gameRef.current.snake.length - 1] });
        }
        setTimeout(() => {
          if (!gameRef.current.running) return;
          const respawnPos = safePos();
          if (respawnPos) {
            const dd = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }][rndInt(4)];
            enemy.body = [
              respawnPos,
              { x: (respawnPos.x - dd.x + COLS) % COLS, y: respawnPos.y },
              { x: (respawnPos.x - dd.x * 2 + COLS) % COLS, y: respawnPos.y },
            ];
            enemy.dir = { ...dd };
            enemy.active = true;
            showEventBanner('💀', 'ENEMY RESPAWN!', 'The enemy is back!');
          }
        }, 3000);
        break;
      }

      if (enemy.body.slice(1).some(s => s.x === newHead.x && s.y === newHead.y)) {
        if (gameRef.current.powerups.shield) {
          delete gameRef.current.powerups.shield;
          updateHUD();
          break;
        }
        gameOver();
        return;
      }
    }

    for (const portal of gameRef.current.portals) {
      if (newHead.x === portal.a.x && newHead.y === portal.a.y) {
        newHead.x = portal.b.x;
        newHead.y = portal.b.y;
        break;
      }
      if (newHead.x === portal.b.x && newHead.y === portal.b.y) {
        newHead.x = portal.a.x;
        newHead.y = portal.a.y;
        break;
      }
    }

    gameRef.current.snake.unshift(newHead);

    const foodIndex = gameRef.current.foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);

    if (foodIndex >= 0) {
      const food = gameRef.current.foods[foodIndex];
      gameRef.current.foods.splice(foodIndex, 1);
      const multiplier = registerCombo();
      const type = food.type;

      if (type === 'apple') {
        addScore(food.info.score * multiplier, 'eat');
        floatText('+' + (food.info.score * multiplier), newHead, '#4ade80');
      } else if (type === 'gold') {
        addScore(food.info.score * multiplier, 'gold');
        floatText('🌟 +' + (food.info.score * multiplier) + '!', newHead, '#fbbf24');
      } else if (type === 'speed') {
        const newSpeed = Math.max(MIN_SPEED, gameRef.current.speed - 30);
        gameRef.current.speed = newSpeed;
        setCurrentSpeed(newSpeed);
        clearInterval(gameRef.current.loop);
        gameRef.current.loop = setInterval(tick, gameRef.current.speed);
        floatText('⚡ BOOST!', newHead, '#fbbf24');
        setTimeout(() => {
          if (gameRef.current.running) {
            const level = Math.floor(gameRef.current.score / 10);
            const normalSpeed = Math.max(MIN_SPEED, START_SPEED - (level * SPEED_INCREASE));
            gameRef.current.speed = normalSpeed;
            setCurrentSpeed(normalSpeed);
            clearInterval(gameRef.current.loop);
            gameRef.current.loop = setInterval(tick, gameRef.current.speed);
          }
        }, food.info.duration);
      } else if (type === 'bomb') {
        const cut = Math.min(3, gameRef.current.snake.length - 3);
        if (cut > 0) gameRef.current.snake.splice(gameRef.current.snake.length - cut, cut);
        addScore(food.info.score, 'bomb');
        floatText('💥 -' + cut + '!', newHead, '#6b7280');
      } else if (type === 'poison') {
        const cut = Math.min(2, gameRef.current.snake.length - 3);
        if (cut > 0) gameRef.current.snake.splice(gameRef.current.snake.length - cut, cut);
        addScore(food.info.score, 'bomb');
        floatText('☢️ POISON!', newHead, '#84cc16');
      } else if (type === 'powerup') {
        activatePowerup(food.pu);
        floatText(POWERUP_INFO[food.pu].emoji + ' ' + POWERUP_INFO[food.pu].label + '!', newHead, '#a78bfa');
      }
      ensureApple();
    } else {
      gameRef.current.snake.pop();
    }

    setSnakeLen(gameRef.current.snake.length);

    if (gameRef.current.score >= gameRef.current.wallThreshold && gameRef.current.score > 0) {
      gameRef.current.wallThreshold += 10;
      addWalls();
    }

    if (gameRef.current.score >= gameRef.current.eventThreshold && gameRef.current.score > 30) {
      gameRef.current.eventThreshold += 10;
      triggerRandomEvent();
    }

    const newThemeIdx = Math.floor(gameRef.current.score / 10);
    if (newThemeIdx > gameRef.current.themeIdx && newThemeIdx < gameRef.current.MAP_THEMES.length) {
      gameRef.current.themeIdx = newThemeIdx;
      const newTheme = gameRef.current.MAP_THEMES[newThemeIdx];
      setThemeName(newTheme.name);
      setCurrentLevel(newTheme.level || newThemeIdx + 1);
      showLevelBanner(newTheme.level || newThemeIdx + 1, newTheme.name);
      initMechanic(newTheme);
    }

    if (gameRef.current.score >= ENEMY1_AT && gameRef.current.enemies.length === 0) spawnEnemy(0);
    if (gameRef.current.score >= ENEMY2_AT && gameRef.current.enemies.length === 1) spawnEnemy(1);
    if (gameRef.current.score >= ENEMY3_AT && gameRef.current.enemies.length === 2) spawnEnemy(2);
    if (gameRef.current.score >= ANACONDA_AT && !gameRef.current.anaconda) spawnAnaconda();

    updateHUD();
    renderCanvas();
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const COLS = gameRef.current?.COLS || 0;
    const ROWS = gameRef.current?.ROWS || 0;

    if (W === 0 || H === 0 || COLS === 0 || ROWS === 0) return;

    const th = getTheme();
    gameRef.current.rainbowHue = (gameRef.current.rainbowHue + 2) % 360;

    // Clear game canvas (background is on bgCanvas)
    ctx.clearRect(0, 0, W, H);

    if (gameRef.current.glitchActive) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4);
    }

    // Semi-transparent grid overlay on top of background
    ctx.strokeStyle = (th.gridColor || th.grid) + '80';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke();
    }

    // Sandstorm overlay
    if (th.mechanic === 'sandstorm' && gameRef.current.sandstormAlpha > 0.05) {
      if (Math.abs(gameRef.current.sandstormAlpha - gameRef.current.sandstormTarget) > 0.01) {
        gameRef.current.sandstormAlpha += (gameRef.current.sandstormTarget - gameRef.current.sandstormAlpha) * 0.02;
      }
      ctx.fillStyle = `rgba(120,80,20,${gameRef.current.sandstormAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }

    if (gameRef.current.waterLevel > 0) {
      const wy = H - gameRef.current.waterLevel * CELL;
      ctx.fillStyle = 'rgba(56,189,248,0.25)';
      ctx.fillRect(0, wy, W, H - wy);
      ctx.strokeStyle = 'rgba(56,189,248,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, wy);
      ctx.lineTo(W, wy);
      ctx.stroke();
    }

    gameRef.current.portals.forEach((portal) => {
      [portal.a, portal.b].forEach((point, pti) => {
        const px = point.x * CELL + CELL / 2;
        const py = point.y * CELL + CELL / 2;
        ctx.fillStyle = pti === 0 ? 'rgba(167,139,250,0.5)' : 'rgba(34,211,238,0.5)';
        ctx.beginPath();
        ctx.arc(px, py, CELL / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '16px serif';
        ctx.fillText('🌀', px, py + 5);
      });
    });

    gameRef.current.disappearedTiles.forEach(key => {
      const [tx, ty] = key.split(',').map(Number);
      ctx.fillStyle = '#000';
      ctx.fillRect(tx * CELL, ty * CELL, CELL, CELL);
      ctx.strokeStyle = '#4ade80';
      ctx.strokeRect(tx * CELL + 1, ty * CELL + 1, CELL - 2, CELL - 2);
    });

    gameRef.current.walls.forEach(key => {
      const [wx, wy] = key.split(',').map(Number);
      ctx.fillStyle = th.wall;
      ctx.fillRect(wx * CELL + 1, wy * CELL + 1, CELL - 2, CELL - 2);
      ctx.fillStyle = th.wallHighlight;
      ctx.fillRect(wx * CELL + 2, wy * CELL + 2, CELL - 4, 3);
    });

    gameRef.current.electricBarriers.forEach(barrier => {
      if (!barrier.active) return;
      barrier.cells.forEach(c => {
        const t = Date.now();
        ctx.fillStyle = `rgba(45,212,191,${0.4 + Math.sin(t / 100) * 0.3})`;
        ctx.fillRect(c.x * CELL + 1, c.y * CELL + 1, CELL - 2, CELL - 2);
        ctx.fillStyle = '#fff';
        ctx.font = '14px serif';
        ctx.fillText('⚡', c.x * CELL + CELL / 2, c.y * CELL + CELL / 2 + 3);
      });
    });

    ctx.font = `${CELL - 4}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    gameRef.current.foods.forEach(food => {
      const fx = food.x * CELL + CELL / 2;
      const fy = food.y * CELL + CELL / 2;
      if (food.type === 'gold') {
        ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 200) * 0.3;
      }
      ctx.fillStyle = '#fff';
      ctx.fillText(food.info.emoji, fx, fy + 1);
      ctx.globalAlpha = 1;
      if (food.type !== 'apple' && food.info.vanish) {
        const elapsed = Date.now() - food.born;
        const pct = Math.max(0, 1 - (elapsed / food.info.vanish));
        ctx.strokeStyle = food.info.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(fx, fy, CELL / 2 - 4, -Math.PI / 2, (Math.PI * 2 * pct) - Math.PI / 2);
        ctx.stroke();
      }
    });

    gameRef.current.enemies.forEach(enemy => {
      if (!enemy.active) return;
      enemy.body.forEach((seg, i) => {
        const sx = seg.x * CELL;
        const sy = seg.y * CELL;
        if (i === 0) {
          ctx.fillStyle = enemy.cfg.headColor;
          ctx.fillRect(sx + 1, sy + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = '#000';
          ctx.fillRect(sx + CELL - 8, sy + 5, 3, 3);
          ctx.fillRect(sx + 5, sy + 5, 3, 3);
          ctx.fillStyle = '#fff';
          ctx.font = '10px serif';
          ctx.fillText('💀', sx + CELL / 2, sy - 3);
        } else {
          ctx.fillStyle = enemy.cfg.bodyColor;
          ctx.fillRect(sx + 2, sy + 2, CELL - 4, CELL - 4);
        }
      });
    });

    // ── ANACONDA RENDER ─────────────────────────────────────────────────────
    const ana = gameRef.current.anaconda;
    if (ana && ana.active) {
      const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
      ana.body.forEach((seg, i) => {
        const sx = seg.x * CELL;
        const sy = seg.y * CELL;
        if (i === 0) {
          // Anaconda head — larger, crowned
          ctx.globalAlpha = ana.enraged ? (0.7 + Math.sin(Date.now() * 0.02) * 0.3) : 1;
          ctx.fillStyle = ana.enraged ? '#ef4444' : ANACONDA_CONFIG.headColor;
          ctx.fillRect(sx - 1, sy - 1, CELL + 2, CELL + 2); // bigger head

          // Crown glow when healthy
          if (!ana.enraged) {
            ctx.strokeStyle = `rgba(251,191,36,${pulse})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(sx - 2, sy - 2, CELL + 4, CELL + 4);
          }

          // Eyes
          ctx.fillStyle = ana.enraged ? '#fbbf24' : '#1a0000';
          ctx.fillRect(sx + CELL - 7, sy + 4, 4, 4);
          ctx.fillRect(sx + 3, sy + 4, 4, 4);

          // HP indicator above head
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('👑' + '❤️'.repeat(ana.health), sx + CELL / 2, sy - 5);

          ctx.globalAlpha = 1;
        } else {
          // Diamond/scale pattern for anaconda body
          const segPct = i / ana.body.length;
          const bodyW = CELL - 2 - Math.floor(segPct * 4);
          const offset = 1 + Math.floor(segPct * 2);
          ctx.fillStyle = i % 2 === 0 ? ANACONDA_CONFIG.bodyColor : ANACONDA_CONFIG.patternColor;
          ctx.fillRect(sx + offset, sy + offset, bodyW, bodyW);
          // Scale accent
          if (i % 3 === 0) {
            ctx.fillStyle = `rgba(251,191,36,0.3)`;
            ctx.fillRect(sx + offset + 2, sy + offset + 2, bodyW - 4, 3);
          }
        }
      });
    }

    gameRef.current.snake.forEach((seg, i) => {
      const sx = seg.x * CELL;
      const sy = seg.y * CELL;

      if (i === 0) {
        if (gameRef.current.powerups.shield) {
          ctx.fillStyle = 'rgba(74,222,128,0.3)';
          ctx.fillRect(sx - 3, sy - 3, CELL + 6, CELL + 6);
        }
        ctx.fillStyle = th.snakeHead;
        ctx.fillRect(sx + 1, sy + 1, CELL - 2, CELL - 2);

        ctx.fillStyle = th.eye;
        const dirX = gameRef.current.dir.x;
        const dirY = gameRef.current.dir.y;
        const cx2 = sx + CELL / 2;
        const cy2 = sy + CELL / 2;
        ctx.fillRect(cx2 + dirX * 4 + dirY * 3 - 3, cy2 + dirY * 4 + dirX * 3 - 3, 3, 3);
        ctx.fillRect(cx2 + dirX * 4 - dirY * 3 - 3, cy2 + dirY * 4 - dirX * 3 - 3, 3, 3);

        ctx.strokeStyle = th.tongue;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx2 + dirX * 9, cy2 + dirY * 9);
        ctx.lineTo(cx2 + dirX * 13 + dirY * 2, cy2 + dirY * 13 + dirX * 2);
        ctx.moveTo(cx2 + dirX * 9, cy2 + dirY * 9);
        ctx.lineTo(cx2 + dirX * 13 - dirY * 2, cy2 + dirY * 13 - dirX * 2);
        ctx.stroke();
      } else {
        let bodyColor = th.snakeBody;
        if (bodyColor === 'rainbow') {
          bodyColor = `hsl(${(gameRef.current.rainbowHue + i * 15) % 360}, 100%, 65%)`;
        } else if (gameRef.current.comboCount >= 3) {
          bodyColor = '#fbbf24';
        } else if (gameRef.current.comboCount >= 2) {
          bodyColor = '#34d399';
        }
        ctx.fillStyle = bodyColor;
        ctx.fillRect(sx + 2, sy + 2, CELL - 4, CELL - 4);
      }
    });

    if (gameRef.current.glitchActive) {
      ctx.restore();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      ctx.fillRect(2, 0, W, H);
      ctx.fillStyle = 'rgba(0,255,255,0.3)';
      ctx.fillRect(-2, 0, W, H);
      ctx.globalAlpha = 1;
    }
  };

  const startGame = async () => {
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    clearAllTimers();

    let freshBest = bestRef.current;
    if (user) {
      try {
        const { data, error } = await supabase
          .from('scores')
          .select('high_score')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!error && data && data.high_score > freshBest) freshBest = data.high_score;
      } catch (_) {}
    } else {
      const localBest = parseInt(localStorage.getItem('snkBest5') || '0');
      if (localBest > freshBest) freshBest = localBest;
    }

    bestRef.current = freshBest;
    setBest(freshBest);

    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width;
    canvas.height = height;
    bgCanvas.width = width;
    bgCanvas.height = height;

    const COLS = Math.floor(width / CELL);
    const ROWS = Math.floor(height / CELL);

    gameRef.current = initializeGame(freshBest);
    gameRef.current.COLS = COLS;
    gameRef.current.ROWS = ROWS;
    gameRef.current.running = true;
    gameRef.current.speed = START_SPEED;
    setCurrentSpeed(START_SPEED);
    setCurrentLevel(1);

    const startX = Math.floor(COLS / 2);
    const startY = Math.floor(ROWS / 2);
    gameRef.current.snake = [
      { x: startX,     y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];

    spawnSpecificFood('apple');
    spawnSpecificFood('apple');

    gameRef.current.bonusLoop = setInterval(spawnBonusFood, BONUS_SPAWN_INTERVAL);

    updateHUD();

    // Draw initial background
    const th = MAP_THEMES_POOL[0];
    if (th.drawBg) th.drawBg(bgCanvas.getContext('2d'), width, height, 0);

    // Start background animation loop
    animateBackground();

    renderCanvas();
    gameRef.current.loop = setInterval(tick, gameRef.current.speed);

    const overlay = document.getElementById('gameOverlay');
    if (overlay) overlay.style.display = 'none';
  };

  const handleKeyPress = useCallback((e) => {
    if (!gameRef.current?.running) return;
    if (gameRef.current.paused) {
      if (e.key === ' ' || e.key === 'Space' || e.key === 'p' || e.key === 'P') {
        gameRef.current.paused = false;
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) overlay.style.display = 'none';
      }
      return;
    }

    let dx = 0, dy = 0;

    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W': dx = 0;  dy = -1; break;
      case 'ArrowDown':  case 's': case 'S': dx = 0;  dy = 1;  break;
      case 'ArrowLeft':  case 'a': case 'A': dx = -1; dy = 0;  break;
      case 'ArrowRight': case 'd': case 'D': dx = 1;  dy = 0;  break;
      case ' ':
      case 'p':
      case 'P': {
        gameRef.current.paused = true;
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay) pauseOverlay.style.display = 'flex';
        e.preventDefault();
        return;
      }
      case 'r': case 'R':
        startGame();
        e.preventDefault();
        return;
      default: return;
    }

    if (dx === 0 && dy === 0) return;
    if ((dx !== 0 && dx === -gameRef.current.dir.x) || (dy !== 0 && dy === -gameRef.current.dir.y)) return;

    gameRef.current.nextDir = { x: dx, y: dy };
    e.preventDefault();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResize = useCallback(() => {
    if (gameRef.current?.running) {
      const canvas = canvasRef.current;
      const bgCanvas = bgCanvasRef.current;
      const container = canvas?.parentElement;
      if (canvas && bgCanvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        bgCanvas.width = container.clientWidth;
        bgCanvas.height = container.clientHeight;
        gameRef.current.COLS = Math.floor(container.clientWidth / CELL);
        gameRef.current.ROWS = Math.floor(container.clientHeight / CELL);
        renderCanvas();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('resize', handleResize);

    setTimeout(() => {
      startGame();
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('resize', handleResize);
      clearAllTimers();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatUp {
        0%   { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-50px) scale(1.3); }
      }
      @keyframes levelPop {
        0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
        20%  { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        80%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      }
      @keyframes anacondaPulse {
        0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.4); }
        50% { box-shadow: 0 0 40px rgba(251,191,36,0.8); }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const getSpeedColor = () => {
    if (speedPercentage < 30) return '#4ade80';
    if (speedPercentage < 70) return '#fbbf24';
    return '#f87171';
  };

  const anacondaAlive = gameRef.current?.anaconda?.active;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#04080d', zIndex: 1000 }}>
      {/* HUD */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 20px', background: 'rgba(8,16,26,0.97)',
        borderBottom: '1px solid #1a2d3f', zIndex: 1001, flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onBack}
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #4ade80', borderRadius: '8px', cursor: 'pointer', fontFamily: 'monospace' }}
          >← Back</button>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Level badge */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#4a7a9b' }}>LEVEL</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#a78bfa' }}>{currentLevel}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#4a7a9b' }}>SCORE</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80' }}>{score}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#4a7a9b' }}>BEST</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22d3ee' }}>{best}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#4a7a9b' }}>LENGTH</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fb923c' }}>{snakeLen}</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '120px' }}>
            <div style={{ fontSize: '10px', color: '#4a7a9b' }}>SPEED</div>
            <div style={{ width: '120px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ width: `${speedPercentage}%`, height: '100%', background: getSpeedColor(), borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '9px', color: getSpeedColor(), marginTop: '2px' }}>
              {Math.round((START_SPEED - currentSpeed) / (START_SPEED - MIN_SPEED) * 100)}%
            </div>
          </div>
          {combo > 1 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#fbbf24' }}>COMBO</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fbbf24' }}>x{combo}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ padding: '4px 12px', background: 'rgba(34,211,238,0.1)', borderRadius: '20px', fontSize: '12px', color: '#22d3ee' }}>{themeName}</div>
          {anacondaAlive && (
            <div style={{
              padding: '4px 12px', background: 'rgba(251,191,36,0.15)', borderRadius: '20px',
              fontSize: '12px', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)',
              animation: 'anacondaPulse 1.5s infinite',
            }}>
              👑 QUEEN ANACONDA HP: {'❤️'.repeat(gameRef.current?.anaconda?.health || 0)}
            </div>
          )}
          <div style={{ display: 'flex', gap: '5px' }}>
            {powerups.map(p => (
              <span key={p.label} style={{ padding: '2px 8px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', fontSize: '11px' }}>
                {p.emoji} {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas stack: background + game layer */}
      <div style={{ width: '100%', height: '100%', paddingTop: '70px', position: 'relative' }}>
        {/* Background canvas */}
        <canvas
          ref={bgCanvasRef}
          style={{ position: 'absolute', top: '70px', left: 0, width: '100%', height: 'calc(100% - 70px)', display: 'block' }}
        />
        {/* Game canvas (transparent bg, renders on top) */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: '70px', left: 0, width: '100%', height: 'calc(100% - 70px)', display: 'block', cursor: 'pointer' }}
        />
      </div>

      {/* Event Banner */}
      <div
        id="event-banner"
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.95)', border: '2px solid #fbbf24', borderRadius: '12px',
          padding: '20px 40px', textAlign: 'center', zIndex: 1002,
          display: 'none', flexDirection: 'column', alignItems: 'center', gap: '5px',
        }}
      />

      {/* Level Transition Banner */}
      <div
        id="level-banner"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.92)',
          border: '2px solid #a78bfa',
          borderRadius: '16px',
          padding: '24px 48px',
          textAlign: 'center',
          zIndex: 1003,
          display: 'none',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          animation: 'levelPop 2.5s ease forwards',
        }}
      />

      {/* Game Over Overlay */}
      <div
        id="gameOverlay"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(4,8,13,0.95)', backdropFilter: 'blur(6px)', zIndex: 1002, gap: '20px',
        }}
      >
        <div style={{ fontSize: '64px' }}>💀</div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f87171', fontFamily: 'monospace' }}>GAME OVER</div>
        <div style={{ fontSize: '24px', color: '#4ade80' }}>Score: {score}</div>
        <div style={{ fontSize: '18px', color: '#a78bfa' }}>Level {currentLevel} reached</div>
        {score >= best && best > 0 && (
          <div style={{ fontSize: '18px', color: '#fbbf24' }}>🏆 New High Score!</div>
        )}
        <button
          onClick={startGame}
          style={{ padding: '12px 40px', background: '#4ade80', color: '#052e16', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
        >PLAY AGAIN</button>
      </div>

      {/* Pause Overlay */}
      <div
        id="pauseOverlay"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(4,8,13,0.95)', backdropFilter: 'blur(6px)', zIndex: 1002, gap: '20px',
        }}
      >
        <div style={{ fontSize: '64px' }}>⏸️</div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#22d3ee', fontFamily: 'monospace' }}>PAUSED</div>
        <div style={{ fontSize: '16px', color: '#4a7a9b', marginBottom: '10px' }}>Level {currentLevel} — {themeName}</div>
        <button
          onClick={() => {
            if (gameRef.current) gameRef.current.paused = false;
            document.getElementById('pauseOverlay').style.display = 'none';
          }}
          style={{ padding: '12px 40px', background: '#22d3ee', color: '#052e16', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
        >RESUME</button>
      </div>
    </div>
  );
};

export default SnakeGame;