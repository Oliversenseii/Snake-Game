# 🐍 Snake Game

A feature-rich, browser-based Snake game with multiple themes, enemy snakes, power-ups, combo systems, and a global leaderboard — built with React and Supabase.

---

## 🛠 Tech Stack

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 📦 Version 1.0.0

### ✨ Features
- 16 unique world themes, each unlocked every 10 points (Classic, Neon City, Deep Space, Nightmare, and more)
- 6 food types — Apple, Gold Star, Speed Boost, Bomb, Poison, Power-up Orb
- 4 active power-ups — Ghost, Magnet, Slow, Shield
- Combo multiplier system — up to ×8 score multiplier
- 3 progressive enemy snakes that spawn at score milestones (20 / 40 / 60)
- Random events — Food Rain and Portals
- World mechanics per theme — slippery ice, electric barriers, wind push, rising water, glitch, nightmare mode
- Dynamic wall generation every 10 points
- Speed bar HUD showing real-time snake velocity
- Sound effects via Web Audio API (eat, combo, power-up, game over, and more)
- Global leaderboard powered by Supabase
- Pause / Resume support
- Responsive canvas that adapts to any screen size

---

## 🎮 Gameplay Overview

- Score increases by eating food — combos multiply your points
- Every 10 points: speed increases, new walls spawn, and a new theme unlocks
- Enemy snakes appear at score 20, 40, and 60 — eat their head to gain points
- Random events (Food Rain, Portals) trigger after score 30
- Each theme introduces a unique world mechanic that changes how the game plays

