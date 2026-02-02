# Rescue

A Defender-style side-scrolling shooter built with Next.js and TypeScript.

Protect humans on the ground from alien Landers. The world wraps horizontally, and a radar shows the full landscape. Destroy Landers before they grab humans, or catch falling humans after destroying abducting aliens.

## Play

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Controls

| Key | Action |
|-----|--------|
| Left/Right Arrow | Thrust (sets facing direction) |
| Up/Down Arrow | Vertical movement |
| Space | Fire laser |

## Gameplay

- Landers spawn at the top and descend toward humans
- Destroy Landers before they grab humans (150 points)
- If a Lander grabs a human, destroy it before it escapes (200 points)
- Catch falling humans (250 points) and land for bonus (500 points)
- Survive waves of increasing difficulty

## Scoring

- Destroy Lander: 150 pts
- Destroy Lander (carrying human): 200 pts
- Catch falling human: 250 pts
- Return human to ground: 500 pts bonus
- Wave complete: 1000 x wave number

## Technical Details

- Canvas-based rendering at 60 FPS
- Wraparound world (2560px logical width)
- Radar minimap showing entire world
- Physics-based ship movement with inertia

## Development

```bash
npm test        # Run tests (171 passing)
npm run build   # Production build
npm run lint    # Check code style
```

## License

MIT
