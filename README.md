# NeonPet 🐾

A neon-themed virtual pet browser game built with Next.js 15, TypeScript, and Framer Motion. Raise your digital companion through five evolution stages while keeping it fed, happy, and healthy!

## Features

- **5 Evolution Stages**: Egg → Baby → Child → Teen → Adult
- **4 Pet Types**: Angel, Normal, Mischief, and Sickly — determined by how well you care for your pet
- **HTML5 Canvas pet rendering** with smooth 60fps animations
- **Web Audio API sound effects** — no external audio files required
- **Glassmorphism + Neon UI** with Framer Motion animations
- **3 Difficulty levels**: Easy, Medium, and Hard
- **High score persistence** via localStorage
- **Keyboard shortcuts** for quick actions
- **Mobile responsive** with touch-friendly controls
- **Real-time stat decay** with health consequences

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- TypeScript (strict mode)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [Framer Motion v11](https://www.framer.com/motion/)
- Web Audio API (programmatic sounds)
- HTML5 Canvas (pet rendering)

## Controls

| Key | Action |
|-----|--------|
| `Space` | Pause / Resume |
| `F` | Feed pet |
| `P` | Play with pet |
| `C` | Clean pet |
| `S` | Put pet to sleep |
| `M` | Give medicine |

All actions are also available via on-screen buttons (mobile touch-friendly).

## How to Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to [Vercel](https://vercel.com) for automatic deployments.

## Game Mechanics

### Stats
- **Hunger** (0=full, 100=starving): Increases over time. High hunger damages health.
- **Happiness** (0=sad, 100=happy): Decreases over time. Low happiness slowly damages health.
- **Health** (0=dead, 100=perfect): Damaged by poor stats, regenerates when all stats are good.
- **Cleanliness** (0=dirty, 100=clean): Decreases over time. Low cleanliness damages health.
- **Energy** (0=exhausted, 100=energetic): Decreases over time. Low energy limits actions.

### Actions
- **Feed**: Reduces hunger, small happiness boost
- **Play**: Boosts happiness, costs energy, increases hunger
- **Clean**: Restores cleanliness
- **Sleep**: Restores energy
- **Medicine**: Restores health (only effective when unhealthy)

### Pet Type (determined by care quality)
- **Angel**: High happiness AND health average → Blue, gets halo + wings
- **Normal**: Decent happiness and health → Orange, balanced
- **Sickly**: Low health average → Green, has sweat drops
- **Mischief**: Low averages overall → Purple, gets devil horns

### Score
Score increases every tick based on:
- Current happiness level
- Evolution stage multiplier
- Health bonus (>80 health = 1.2x)

## Screenshots

*Game in action — neon glassmorphism UI with animated canvas pet*
