import React, { useState, useEffect } from 'react';

/* ─── tiny atoms ─────────────────────────────────────── */

const Kbd = ({ children }) => (
  <kbd style={{
    display: 'inline-block',
    background: '#0a2210',
    border: '1px solid #2d5a35',
    borderRadius: 5,
    padding: '2px 8px',
    fontSize: 13,
    color: '#4ade80',
    fontFamily: 'monospace',
    marginRight: 4,
  }}>
    {children}
  </kbd>
);

const Tag = ({ children, type }) => {
  const styles = {
    enemy: { background: '#3a0a0a', color: '#f87171', border: '1px solid #7a1515' },
    event: { background: '#2a2000', color: '#fbbf24', border: '1px solid #7a5500' },
    theme: { background: '#002a2a', color: '#22d3ee', border: '1px solid #0a5a5a' },
  };
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 99,
      marginLeft: 8,
      verticalAlign: 'middle',
      ...styles[type],
    }}>
      {children}
    </span>
  );
};

const SectionLabel = ({ children, first }) => (
  <p style={{
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#3a6a42',
    margin: first ? '0 0 12px' : '24px 0 12px',
  }}>
    {children}
  </p>
);

const Card = ({ icon, name, nameSuffix, desc, badge, badgeType }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    background: '#0d2210',
    border: '1px solid #1e4a24',
    borderRadius: 12,
    padding: '14px 16px',
  }}>
    <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#86efac', marginBottom: 5 }}>
        {name}
        {nameSuffix && (
          <span style={{ fontSize: 12, color: '#3a6a42', fontWeight: 400, marginLeft: 6 }}>
            {nameSuffix}
          </span>
        )}
        {badge && <Tag type={badgeType}>{badge}</Tag>}
      </div>
      <div style={{ fontSize: 13, color: '#4a7a52', lineHeight: 1.55 }}>{desc}</div>
    </div>
  </div>
);

/* ─── tab panes ──────────────────────────────────────── */

const TabControls = () => (
  <>
    <SectionLabel first>Movement</SectionLabel>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 0 }}>
      <Card icon="⬆️" name="Move Up"    desc={<><Kbd>W</Kbd><Kbd>↑</Kbd></>} />
      <Card icon="⬇️" name="Move Down"  desc={<><Kbd>S</Kbd><Kbd>↓</Kbd></>} />
      <Card icon="⬅️" name="Move Left"  desc={<><Kbd>A</Kbd><Kbd>←</Kbd></>} />
      <Card icon="➡️" name="Move Right" desc={<><Kbd>D</Kbd><Kbd>→</Kbd></>} />
    </div>

    <SectionLabel>Game Controls</SectionLabel>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <Card icon="⏸️" name="Pause / Resume" desc={<><Kbd>Space</Kbd><Kbd>P</Kbd></>} />
      <Card icon="🔄" name="Restart"         desc={<Kbd>R</Kbd>} />
    </div>

    <SectionLabel>Scoring Tips</SectionLabel>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Card icon="🔥" name="Combo Multiplier"
        desc="Eat within 2.5 s of each other to stack combos — up to ×8. Snake turns gold!" />
      <Card icon="🚀" name="Speed Increases Every 10 Pts"
        desc="The faster the snake, the harder it gets. Watch the HUD speed bar." />
      <Card icon="🏆" name="Walls Spawn Every 10 Pts"
        desc="New walls appear as you score. Plan your path ahead!" />
    </div>
  </>
);

const TabFood = () => (
  <>
    <SectionLabel first>Foods & Effects</SectionLabel>
    {[
      { emoji: '🍎', name: 'Apple',        score: '+1', type: 'pos', desc: 'Always present. Eat to grow and score.' },
      { emoji: '🌟', name: 'Gold Star',    score: '+5', type: 'pos', desc: 'Rare — vanishes in 5 s. Grab it fast!' },
      { emoji: '⚡', name: 'Speed Boost',  score: '+0', type: 'neu', desc: 'Temporarily boosts speed for 5 s. Risky!' },
      { emoji: '💣', name: 'Bomb',         score: '−3', type: 'neg', desc: 'Cuts 3 segments from your tail. Avoid!' },
      { emoji: '☢️', name: 'Poison',       score: '−2', type: 'neg', desc: 'Cuts 2 tail segments. Vanishes in 7 s.' },
      { emoji: '🎁', name: 'Power-up Orb', score: '+0', type: 'neu', desc: 'Grants a random power-up — see next tab.' },
    ].map(f => (
      <div key={f.name} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 4px',
        borderBottom: '1px solid #1a3a1e',
      }}>
        <span style={{ fontSize: 22, width: 34, textAlign: 'center', flexShrink: 0 }}>{f.emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#86efac', width: 120, flexShrink: 0 }}>{f.name}</span>
        <span style={{
          fontSize: 16, fontWeight: 800, width: 40, flexShrink: 0,
          color: f.type === 'pos' ? '#4ade80' : f.type === 'neg' ? '#f87171' : '#38bdf8',
        }}>
          {f.score}
        </span>
        <span style={{ fontSize: 13, color: '#4a7a52', lineHeight: 1.5 }}>{f.desc}</span>
      </div>
    ))}
  </>
);

const TabPowerups = () => (
  <>
    <SectionLabel first>Active Power-ups</SectionLabel>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Card icon="👻" name="Ghost"  nameSuffix="5 s"     desc="Pass through walls, barriers, and your own tail." />
      <Card icon="🧲" name="Magnet" nameSuffix="6 s"     desc="Food within 4 cells is pulled toward you automatically." />
      <Card icon="🐌" name="Slow"   nameSuffix="5 s"     desc="Halves your speed temporarily — take a breath!" />
      <Card icon="🛡️" name="Shield" nameSuffix="one-hit" desc="Absorbs one fatal hit from walls, enemies, or yourself." />
    </div>

    <SectionLabel>Enemy Snakes</SectionLabel>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Card icon="👾" name="Snake 1" badge="score 20" badgeType="enemy"
        desc="Aggressive — targets your head directly. Eat its head for +3 pts!" />
      <Card icon="🌸" name="Snake 2" badge="score 40" badgeType="enemy"
        desc="Chases food randomly. Two enemies now — stay alert." />
      <Card icon="⚔️" name="Snake 3" badge="score 60" badgeType="enemy"
        desc="Patrol pattern. Three enemies at once — good luck!" />
    </div>
  </>
);

const TabMechanics = () => (
  <>
    <SectionLabel first>Random Events</SectionLabel>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Card icon="🌧️" name="Food Rain"  badge="random" badgeType="event"
        desc="8 apples drop rapidly onto the board — perfect for building combos." />
      <Card icon="🌀" name="Portals"    badge="random" badgeType="event"
        desc="Two portal pairs appear for 12 s — enter one, exit the other." />
    </div>

    <SectionLabel>World Mechanics (Per Theme)</SectionLabel>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Card icon="❄️"  name="Slippery"         badge="Frozen World"  badgeType="theme" desc="Inertia — direction changes take a moment to register." />
      <Card icon="⚡"  name="Electric Barriers" badge="Cyber Grid"    badgeType="theme" desc="Live barriers toggle every 2.5 s. Ghost ignores them." />
      <Card icon="🌪️" name="Wind Push"         badge="Storm Zone"    badgeType="theme" desc="30% chance each tick your path is nudged by a gust." />
      <Card icon="🌊"  name="Rising Water"      badge="Flooded Grid"  badgeType="theme" desc="Water floods from the bottom every 3 s — don't get caught." />
      <Card icon="👁️" name="Glitch"            badge="Void Realm"    badgeType="theme" desc="Random screen distortions mess with your vision." />
      <Card icon="💀"  name="Nightmare"         badge="Nightmare"     badgeType="theme" desc="Portals + aggressive glitch + moving walls. Pure chaos." />
    </div>
  </>
);

const TABS = [
  { id: 'controls',  label: '🕹️ Controls'  },
  { id: 'food',      label: '🍎 Food'       },
  { id: 'powerups',  label: '⚡ Power-ups'  },
  { id: 'mechanics', label: '🌍 Mechanics'  },
];

const TAB_CONTENT = {
  controls:  TabControls,
  food:      TabFood,
  powerups:  TabPowerups,
  mechanics: TabMechanics,
};

/* ─── main component ─────────────────────────────────── */

const GameMechanicsButton = () => {
  const [open, setOpen]           = useState(false);
  const [activeTab, setActiveTab] = useState('controls');
  const TabContent = TAB_CONTENT[activeTab];

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      {/* ── trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
        style={{
          background: 'rgba(74,222,128,0.08)',
          color: '#4ade80',
          border: '1px solid rgba(74,222,128,0.3)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(74,222,128,0.16)';
          e.currentTarget.style.borderColor = 'rgba(74,222,128,0.55)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(74,222,128,0.08)';
          e.currentTarget.style.borderColor = 'rgba(74,222,128,0.3)';
        }}
      >
        📖 How to Play
      </button>

      {/* ── backdrop + modal ── */}
      {open && (
        <div
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 16,
          }}
        >
          <div style={{
            width: '100%', maxWidth: 600,
            maxHeight: '88vh',
            display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(160deg, #0f2a14 0%, #091a0d 60%, #0b2210 100%)',
            border: '1px solid #2d6a35',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px #1a4a2022, 0 32px 80px #000000aa',
          }}>

            {/* header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '22px 28px 18px',
              borderBottom: '1px solid #1e4a24',
              background: 'linear-gradient(180deg, #122b16 0%, transparent 100%)',
              flexShrink: 0,
            }}>
              <div>
                <div style={{
                  fontSize: 22, fontWeight: 800, color: '#4ade80',
                  textShadow: '0 0 20px #4ade8050',
                  letterSpacing: '-0.3px',
                }}>
                  🐍 Game Mechanics
                </div>
                <div style={{ fontSize: 13, color: '#4a7a52', marginTop: 3 }}>
                  Everything you need to master the snake
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 34, height: 34, borderRadius: 9,
                  border: '1px solid #2a5a32',
                  background: '#0d2210',
                  color: '#4a7a52', fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#4ade80'; e.currentTarget.style.borderColor = '#4ade8055'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#4a7a52'; e.currentTarget.style.borderColor = '#2a5a32'; }}
              >
                ✕
              </button>
            </div>

            {/* tab bar */}
            <div style={{
              display: 'flex', gap: 6, padding: '12px 28px',
              borderBottom: '1px solid #1e4a24',
              background: '#0a1a0e',
              flexShrink: 0, overflowX: 'auto',
            }}>
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                      background: active ? 'rgba(22,83,36,0.5)' : 'transparent',
                      color: active ? '#4ade80' : '#4a7a52',
                      border: active ? '1px solid rgba(74,222,128,0.4)' : '1px solid transparent',
                      boxShadow: active ? '0 0 14px rgba(74,222,128,0.15)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* scrollable content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '22px 28px 28px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#2d6a35 #0a1a0e',
            }}
              className="mechanics-scroll"
            >
              <style>{`
                .mechanics-scroll::-webkit-scrollbar { width: 6px; }
                .mechanics-scroll::-webkit-scrollbar-track { background: #0a1a0e; border-radius: 99px; }
                .mechanics-scroll::-webkit-scrollbar-thumb { background: #2d6a35; border-radius: 99px; }
                .mechanics-scroll::-webkit-scrollbar-thumb:hover { background: rgba(74,222,128,0.45); }
              `}</style>
              <TabContent />
            </div>

            {/* footer */}
            <div style={{
              flexShrink: 0,
              padding: '11px 28px',
              borderTop: '1px solid #1e4a24',
              background: '#0a1a0e',
              fontSize: 12, color: '#2d5a35', textAlign: 'center',
            }}>
              Click outside or press <Kbd>Esc</Kbd> to close
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default GameMechanicsButton;