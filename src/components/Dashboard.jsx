import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Leaderboard from './Leaderboard';


const FOODS = [
  { emoji: '🍎', name: 'Apple',     type: 'apple',   score: '+1',  effect: 'Grow +1 segment',                        color: '#f87171', rarity: 'Common'   },
  { emoji: '🌟', name: 'Gold Star', type: 'gold',    score: '+5',  effect: 'Bonus points, blinks when near expiry',  color: '#fbbf24', rarity: 'Rare'     },
  { emoji: '⚡', name: 'Speed',     type: 'speed',   score: '—',   effect: 'Boost speed for 5 s',                    color: '#fde68a', rarity: 'Uncommon' },
  { emoji: '💣', name: 'Bomb',      type: 'bomb',    score: '−3',  effect: 'Cuts 3 tail segments',                   color: '#9ca3af', rarity: 'Uncommon' },
  { emoji: '☢️', name: 'Poison',    type: 'poison',  score: '−2',  effect: 'Cuts 2 tail segments',                   color: '#84cc16', rarity: 'Uncommon' },
  { emoji: '👻', name: 'Ghost PU',  type: 'powerup', score: '—',   effect: 'Walk through walls & barriers',          color: '#a78bfa', rarity: 'Rare'     },
  { emoji: '🧲', name: 'Magnet PU', type: 'powerup', score: '—',   effect: 'Pull nearby food toward snake',          color: '#22d3ee', rarity: 'Rare'     },
  { emoji: '🐌', name: 'Slow PU',   type: 'powerup', score: '—',   effect: 'Halves speed for 5 s',                   color: '#60a5fa', rarity: 'Rare'     },
  { emoji: '🛡',  name: 'Shield PU', type: 'powerup', score: '—',   effect: 'Absorbs one fatal hit',                  color: '#4ade80', rarity: 'Rare'     },
];

const THEMES = [
  { score: 0,   name: 'Classic 🐍',      mechanic: '—',                desc: 'Standard snake gameplay'                       },
  { score: 10,  name: 'Neon City 🌃',    mechanic: '—',                desc: 'Purple neon aesthetics, no special hazard'      },
  { score: 20,  name: 'Deep Space 🚀',   mechanic: '—',                desc: 'Star-filled void, cyan snake'                   },
  { score: 30,  name: 'Deep Ocean 🌊',   mechanic: '—',                desc: 'Bubble particles, teal snake'                   },
  { score: 40,  name: 'Lava Zone 🌋',    mechanic: '—',                desc: 'Lava particle emitters, orange snake'           },
  { score: 50,  name: 'CHAOS MODE 🌈',   mechanic: '—',                desc: 'Rainbow snake body, all effects active'         },
  { score: 60,  name: 'Frozen World ❄️', mechanic: 'Slippery',         desc: 'Snake slides further than intended'             },
  { score: 70,  name: 'Cyber Grid ⚡',   mechanic: 'Electric Barriers', desc: 'Toggling ⚡ barriers kill on contact'           },
  { score: 80,  name: 'Toxic Area ☢️',   mechanic: 'Poison Surge',     desc: 'Extra poison food spawns more frequently'       },
  { score: 90,  name: 'Storm Zone 🌪️',  mechanic: '—',                desc: 'Monochrome storm, base gameplay'                },
  { score: 100, name: 'Void Realm 👁️',  mechanic: 'Glitch',           desc: 'Screen glitches randomly — hard to see'         },
  { score: 110, name: 'Desert 🏜️',      mechanic: 'Sandstorm',        desc: 'Sandstorm overlay blinds visibility in waves'   },
  { score: 120, name: 'Portal Lab 🌌',   mechanic: 'Many Portals',     desc: '3 portal pairs that refresh every 15 s'         },
  { score: 130, name: 'Inferno 🔥',      mechanic: 'Moving Walls',     desc: 'Placed walls drift around the grid'             },
  { score: 140, name: 'Flooded Grid 🌊', mechanic: 'Rising Water',     desc: 'Tide rises to 50 % then recedes, kills on touch' },
  { score: 150, name: '💀 NIGHTMARE',    mechanic: 'Nightmare',        desc: 'Portals + frequent glitches + max enemies'      },
  { score: 160, name: 'Aquarium 🐠',      mechanic: '—',                  desc: 'Fish & seaweed, bubble particles, teal snake'        },
  { score: 170, name: 'Crystal Cave 💎',   mechanic: 'Disappearing Tiles', desc: 'Crystal shards crumble off the grid, holes kill'     },
  { score: 180, name: 'Geyser Field 🌋',   mechanic: 'Moving Walls',       desc: 'Erupting vents, walls drift around the grid'         },
  { score: 190, name: 'Abyssal Depth 🦑',  mechanic: 'Glitch',             desc: 'Pitch-black abyss, screen glitches constantly'       },
  { score: 200, name: 'Magma Core 🔥',     mechanic: 'Rising Lava',        desc: 'Lava tide rises to 50% then recedes, kills on touch' },
  { score: 210, name: 'Mushroom Forest 🍄', mechanic: 'Disappearing Tiles', desc: 'Bioluminescent caps, spores, tiles crumble beneath'  },
  { score: 220, name: 'Ancient Ruins 🏛️',  mechanic: 'Moving Walls',       desc: 'Stone columns, torch flicker, walls drift around'    },
  { score: 230, name: 'Quantum Realm ⚛️',  mechanic: 'Many Portals',       desc: '3 portal pairs, wave interference patterns'         },
  { score: 240, name: 'Black Hole 🕳️',     mechanic: 'Nightmare',          desc: 'Accretion disk, portals + glitch + max enemies'      },
  { score: 250, name: 'Genesis 💥',         mechanic: 'Nightmare',          desc: 'Rainbow snake, cosmic web, ultimate final challenge' },
];

const ENEMIES = [
  { at: 20, emoji: '👾', name: 'Snake 1',          color: '#f87171', personality: 'Aggressive', desc: 'Hunts your head directly' },
  { at: 40, emoji: '🌸', name: 'Snake 2',          color: '#f472b6', personality: 'Random',     desc: 'Chases food with erratic movement' },
  { at: 60, emoji: '⚔️', name: 'Snake 3',          color: '#facc15', personality: 'Patrol',     desc: 'Patrols food with slight randomness' },
  { at: 80, emoji: '👑', name: 'Queen Anaconda',   color: '#fbbf24', personality: 'Hunter',     desc: 'Aggressively hunts your head; 12-segment body at spawn' },
];

const EVENTS = [
  { emoji: '🌧', name: 'Food Rain', trigger: 'Score ≥ 30, then every +10', desc: '8 apples rain down in rapid succession' },
  { emoji: '🌀', name: 'Portals',   trigger: 'Score ≥ 30, then every +10', desc: '2 portal pairs active for 12 s'         },
];

const MECHANICS_MISC = [
  { name: 'Combo',         emoji: '🔥', desc: 'Eat 2 foods within 2.5 s to multiply points — up to ×8. Snake turns gold at ×3.' },
  { name: 'Walls',         emoji: '🧱', desc: 'New wall segments spawn every 10 points. Higher score = more obstacles.'         },
  { name: 'Speed Up',      emoji: '⚡', desc: 'Every 10 points, game speed increases by 15 ms (min 80 ms interval).'            },
  { name: 'Enemy Respawn', emoji: '💀', desc: 'Eaten enemies respawn 3 s later with a banner announcement.'                    },
  { name: 'Float Text',    emoji: '✨', desc: 'Point gains and power-up labels float above the snake head momentarily.'         },
];


const SectionHeader = ({ emoji, title, subtitle }) => (
  <div style={{ marginBottom: '16px' }}>
    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
      <span>{emoji}</span> {title}
    </h3>
    {subtitle && <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>{subtitle}</p>}
  </div>
);

const Badge = ({ label, color }) => (
  <span style={{
    display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
    fontSize: '11px', fontWeight: '600', color: '#0f172a',
    background: color || '#4ade80',
  }}>{label}</span>
);

const Table = ({ headers, rows }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr>
          {headers.map(h => (
            <th key={h} style={{
              padding: '10px 14px', textAlign: 'left',
              color: '#94a3b8', fontWeight: '600', fontSize: '11px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              whiteSpace: 'nowrap',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: '9px 14px', color: '#cbd5e1', verticalAlign: 'middle' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Card = ({ children, accent = '#4ade80' }) => (
  <div style={{
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderTop: `2px solid ${accent}`,
    borderRadius: '12px',
    padding: '20px',
    backdropFilter: 'blur(8px)',
  }}>
    {children}
  </div>
);


const AnacondaBossCard = () => (
  <Card accent="#fbbf24">
    <SectionHeader
      emoji="👑"
      title="Queen Anaconda — Boss"
      subtitle="Spawns at score 80 and commands all enemy snakes"
    />

    {/* Stats row */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '10px',
      marginBottom: '16px',
    }}>
      {[
        { label: 'Spawns At',    value: 'Score 80',  color: '#fbbf24' },
        { label: 'Health',       value: '3 HP',       color: '#f87171' },
        { label: 'Start Length', value: '12 segments',color: '#fbbf24' },
        { label: 'Kill Reward',  value: '+15 pts',    color: '#4ade80' },
        { label: 'Body Reward',  value: '+5 segments',color: '#34d399' },
        { label: 'Speed',        value: '220 ms tick',color: '#22d3ee' },
      ].map(s => (
        <div key={s.label} style={{
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.35)',
          borderRadius: '8px',
          border: '1px solid rgba(251,191,36,0.15)',
        }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: s.color, fontFamily: 'monospace', marginTop: '2px' }}>{s.value}</div>
        </div>
      ))}
    </div>

    <Table
      headers={['HP', 'Phase', 'Behaviour']}
      rows={[
        [
          <span style={{ fontFamily: 'monospace', color: '#4ade80', fontWeight: '700' }}>❤️❤️❤️</span>,
          <Badge label="Normal" color="#4ade80" />,
          <span style={{ color: '#94a3b8' }}>Hunts your head using shortest-path. Avoids other enemies. All 3 enemies switch to Escort personality to protect her.</span>,
        ],
        [
          <span style={{ fontFamily: 'monospace', color: '#fbbf24', fontWeight: '700' }}>❤️❤️</span>,
          <Badge label="Enraged" color="#fbbf24" />,
          <span style={{ color: '#94a3b8' }}>Hit once — enraged for 4 s. Moves erratically (random factor added to pathfinding), no longer avoids enemies.</span>,
        ],
        [
          <span style={{ fontFamily: 'monospace', color: '#f87171', fontWeight: '700' }}>❤️</span>,
          <Badge label="Critical" color="#f87171" />,
          <span style={{ color: '#94a3b8' }}>One HP left. Head turns red. Still enrageable. Next hit kills her.</span>,
        ],
        [
          <span style={{ fontFamily: 'monospace', color: '#64748b', fontWeight: '700' }}>💀</span>,
          <Badge label="Defeated" color="#94a3b8" />,
          <span style={{ color: '#94a3b8' }}>All enemies go Aggressive. Anaconda respawns after 15 s if score is still ≥ 80.</span>,
        ],
      ]}
    />

    {/* Tips */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
      <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.08)', borderRadius: '8px', fontSize: '12px', color: '#fbbf24', borderLeft: '3px solid #fbbf24' }}>
        ⚔️ <strong>Attack:</strong> Ram your head into <strong>her head</strong> to deal 1 HP. Each hit staggers her briefly.
      </div>
      <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.08)', borderRadius: '8px', fontSize: '12px', color: '#f87171', borderLeft: '3px solid #f87171' }}>
        ☠️ <strong>Danger:</strong> Hitting <strong>her body</strong> kills you instantly (🛡 Shield absorbs one hit). Her escort enemies will actively intercept you.
      </div>
      <div style={{ padding: '10px 14px', background: 'rgba(52,211,153,0.08)', borderRadius: '8px', fontSize: '12px', color: '#34d399', borderLeft: '3px solid #34d399' }}>
        🍎 <strong>She eats food:</strong> Every food she eats grows her body by 2 extra segments — clear food fast to keep her small.
      </div>
    </div>
  </Card>
);


const MechanicsPanel = () => {
  const [tab, setTab] = useState('foods');

  const tabs = [
    { id: 'foods',    label: '🍎 Foods & Power-ups' },
    { id: 'themes',   label: '🎨 Themes & Zones'    },
    { id: 'enemies',  label: '👾 Enemies'            },
    { id: 'boss',     label: '👑 Queen Anaconda'     },
    { id: 'events',   label: '🌀 Events & Misc'      },
  ];

  const rarityColor = (r) => r === 'Common' ? '#4ade80' : r === 'Uncommon' ? '#fbbf24' : '#a78bfa';

  const scoreColor = (s) => {
    if (s.startsWith('+')) return '#4ade80';
    if (s.startsWith('−') || s.startsWith('-')) return '#f87171';
    return '#94a3b8';
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          📖 Game Mechanics
        </h2>
        <p style={{ color: '#f1f5f9', fontSize: '13px', margin: 0 }}>
          Everything you need to know to dominate the leaderboard
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: tab === t.id
                ? (t.id === 'boss' ? '#fbbf24' : '#4ade80')
                : 'rgba(255,255,255,0.06)',
              color: tab === t.id ? '#052e16' : '#94a3b8',
              boxShadow: tab === t.id && t.id === 'boss' ? '0 0 12px rgba(251,191,36,0.4)' : 'none',
            }}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'foods' && (
        <Card accent="#4ade80">
          <SectionHeader emoji="🍽️" title="Foods & Power-ups" subtitle="Spawns every 5 s; up to 2 bonus items on screen at once" />
          <Table
            headers={['Item', 'Name', 'Score', 'Effect', 'Rarity', 'Vanishes In']}
            rows={FOODS.map(f => [
              <span style={{ fontSize: '20px' }}>{f.emoji}</span>,
              <span style={{ color: f.color, fontWeight: '600' }}>{f.name}</span>,
              <span style={{ color: scoreColor(f.score), fontWeight: '700', fontFamily: 'monospace' }}>{f.score}</span>,
              <span style={{ color: '#94a3b8' }}>{f.effect}</span>,
              <Badge label={f.rarity} color={rarityColor(f.rarity)} />,
              <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>
                {f.type === 'apple' ? '∞' :
                  f.type === 'gold' ? '5 s' :
                  f.type === 'speed' ? '8 s' :
                  f.type === 'bomb' ? '10 s' :
                  f.type === 'poison' ? '7 s' : '8 s'}
              </span>,
            ])}
          />
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(251,191,36,0.08)', borderRadius: '8px', fontSize: '12px', color: '#fbbf24', borderLeft: '3px solid #fbbf24' }}>
            💡 <strong>Combo tip:</strong> Eat foods within 2.5 s of each other to stack a multiplier up to ×8. At ×3 combo, your snake glows gold!
          </div>
        </Card>
      )}

      {tab === 'themes' && (
        <Card accent="#22d3ee">
          <SectionHeader emoji="🎨" title="Themes & Zones" subtitle="Theme changes every 10 points — order is randomised each game (Classic always first)" />
          <Table
            headers={['Different Levels', 'Theme', 'Special Mechanic', 'Description']}
            rows={THEMES.map(t => [
              <span style={{ fontFamily: 'monospace', color: '#4ade80', fontWeight: '700' }}>{t.score}</span>,
              <span style={{ fontWeight: '600', color: '#e2e8f0', whiteSpace: 'nowrap' }}>{t.name}</span>,
              t.mechanic === '—'
                ? <span style={{ color: '#334155' }}>—</span>
                : <Badge label={t.mechanic} color="#22d3ee" />,
              <span style={{ color: '#94a3b8' }}>{t.desc}</span>,
            ])}
          />
        </Card>
      )}

      {tab === 'enemies' && (
        <Card accent="#f87171">
          <SectionHeader emoji="👾" title="Enemy Snakes" subtitle="Enemy snakes grow, eat food, and chase you — eat their HEAD to eliminate them" />
          <Table
            headers={['Spawns At', 'Enemy', 'Personality', 'Behaviour', 'On Kill']}
            rows={ENEMIES.map(e => [
              <span style={{ fontFamily: 'monospace', color: e.color, fontWeight: '700' }}>Score {e.at}</span>,
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: e.color }}>
                <span style={{ fontSize: '18px' }}>{e.emoji}</span> {e.name}
              </span>,
              <Badge label={e.personality} color={e.color} />,
              <span style={{ color: '#94a3b8' }}>{e.desc}</span>,
              e.name === 'Queen Anaconda'
                ? <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontSize: '12px' }}>
                    +15 pts<br />
                    <span style={{ color: '#34d399' }}>+5 segments</span><br />
                    <span style={{ color: '#64748b' }}>Respawns in 15 s</span>
                  </span>
                : <span style={{ color: '#4ade80', fontFamily: 'monospace', fontSize: '12px' }}>
                    +max(3, ½ body) pts<br />
                    <span style={{ color: '#64748b' }}>Respawns in 3 s</span>
                  </span>,
            ])}
          />
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.08)', borderRadius: '8px', fontSize: '12px', color: '#f87171', borderLeft: '3px solid #f87171' }}>
              ⚠️ Hitting an enemy's <strong>body</strong> kills you — only hitting the <strong>head</strong> earns points. Use a 🛡 Shield to survive one body hit.
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.08)', borderRadius: '8px', fontSize: '12px', color: '#fbbf24', borderLeft: '3px solid #fbbf24' }}>
              👑 When <strong>Queen Anaconda</strong> spawns at score 80, all 3 enemy snakes switch to <strong>Escort</strong> mode — they orbit her and intercept you. Defeat her to send them back to Aggressive mode.
            </div>
          </div>
        </Card>
      )}

      {tab === 'boss' && <AnacondaBossCard />}

      {tab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card accent="#a78bfa">
            <SectionHeader emoji="🌀" title="Random Events" subtitle="Triggered at score ≥ 30, then every +10 points" />
            <Table
              headers={['Event', 'Name', 'Trigger', 'Effect']}
              rows={EVENTS.map(e => [
                <span style={{ fontSize: '22px' }}>{e.emoji}</span>,
                <span style={{ fontWeight: '600', color: '#c4b5fd' }}>{e.name}</span>,
                <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>{e.trigger}</span>,
                <span style={{ color: '#94a3b8' }}>{e.desc}</span>,
              ])}
            />
          </Card>

          <Card accent="#fbbf24">
            <SectionHeader emoji="⚙️" title="Core Mechanics" subtitle="Always active — master these to maximise your score" />
            <Table
              headers={['Mechanic', 'Details']}
              rows={MECHANICS_MISC.map(m => [
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#fde68a', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '16px' }}>{m.emoji}</span> {m.name}
                </span>,
                <span style={{ color: '#94a3b8' }}>{m.desc}</span>,
              ])}
            />
          </Card>

          <Card accent="#60a5fa">
            <SectionHeader emoji="🎮" title="Controls" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
              {[
                { keys: '↑ W',       action: 'Move Up'    },
                { keys: '↓ S',       action: 'Move Down'  },
                { keys: '← A',       action: 'Move Left'  },
                { keys: '→ D',       action: 'Move Right' },
                { keys: 'Space / P', action: 'Pause'      },
                { keys: 'R',         action: 'Restart'    },
              ].map(c => (
                <div key={c.action} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#7dd3fc', fontWeight: '700' }}>{c.keys}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{c.action}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};


const Dashboard = ({ onPlay }) => {
  const { user, highScore, logout } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0];

  return (
    <div className="min-h-screen p-8" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-green-500/30">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Welcome, {username}! 🐍
              </h1>
              <p className="text-gray-400 mt-1">Ready to beat your high score?</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{highScore}</div>
                <div className="text-xs text-gray-400">HIGH SCORE</div>
              </div>
              <button
                onClick={logout}
                className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-2xl p-8 border border-green-500/30 flex flex-col items-center justify-center text-center">
            <div className="text-8xl mb-4 animate-bounce">🐍</div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Play?</h2>
            <p className="text-gray-300 mb-6">
              Guide the snake, eat the food, and don't hit the walls or yourself!
              Try to beat your high score of{' '}
              <span className="text-green-400 font-bold">{highScore}</span>
            </p>
            <button
              onClick={onPlay}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🎮 Start Game
            </button>
          </div>

          <Leaderboard />
        </div>

        <MechanicsPanel />

      </div>
    </div>
  );
};

export default Dashboard;