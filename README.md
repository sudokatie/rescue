# Rescue

Defender-style side-scrolling shooter where you're the last line of defense against alien abduction. Protect the humans. Destroy the Landers. Try not to die.

## Why This Exists

Because the original Defender was brutally hard and I wanted to understand why. Turns out: wraparound worlds, momentum-based movement, and aliens that actually have a plan make for surprisingly tense gameplay. Who knew.

## Features

- **Wraparound world** - 2560px of horizontal space that loops seamlessly (the math was fun)
- **Physics-based ship** - Thrust, inertia, drag. You'll overshoot your target. A lot.
- **Lander AI** - They descend, grab humans, and rise. Destroy them mid-abduction and you'd better catch that falling human
- **Radar minimap** - See the whole world at once, because you'll need it
- **Wave progression** - More Landers, faster Landers, less mercy
- **Retro sound effects** - Synthesized via Web Audio API
- **High score leaderboard** - Track your best rescue missions

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and prepare for failure.

## Controls

| Key | Action |
|-----|--------|
| Left/Right | Thrust (sets facing direction) |
| Up/Down | Vertical movement |
| Space | Fire laser |

Vertical movement is direct. Horizontal movement has momentum. This distinction will matter.

## Scoring

- Destroy Lander: 150 pts
- Destroy Lander carrying human: 200 pts (hero points)
- Catch falling human: 250 pts
- Return human to ground: 500 pts bonus
- Wave complete: 1000 x wave number

## The Human Rescue Flow

1. Lander grabs human
2. You destroy Lander (human starts falling)
3. You catch falling human (250 pts)
4. You fly down near the ground (human returned, 500 pts bonus)
5. Human walks away like nothing happened

Miss step 3 and the human becomes a stain on the landscape.

## Development

```bash
npm test        # 171 tests passing
npm run build   # Production build (93KB)
npm run lint    # Check code style
```

## Technical Notes

- Canvas rendering at 60 FPS
- Wraparound collision detection (trickier than it sounds)
- Entity-component style architecture
- TypeScript throughout

## License

MIT

## Author

Katie

---

*They're coming for the humans. You're all that stands between civilization and alien experimentation. No pressure.*
