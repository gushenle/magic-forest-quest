# Magic Forest Quest

**[中文](README.md)** | English

A keyboard-driven web adventure game (Assignment 2). Explore a randomly generated magic forest, find the key to open the castle gate, use items to survive the dangers, and finally pick up the **Magic Crystal 💎** to complete the quest.

**🎮 Play online:** <https://gushenle.github.io/magic-forest-quest/>

## Goal

Find and pick up the Magic Crystal 💎 in the magic forest:
- Avoid or drive away monsters, and don't let the swamp drain your health;
- Find the **key** to unlock the castle gate;
- If your **health reaches zero**, the adventure is lost.

The map is generated from a random seed, so every playthrough has a different forest layout.

## Controls

| Key | Action |
| --- | --- |
| Arrow keys / `W` `A` `S` `D` | Move up / left / down / right |
| `E` | Pick up items at the current location |
| Number keys `1`–`9` | Use the corresponding inventory item |
| `I` | Show inventory |
| `L` | Look around |
| Fullscreen button | Toggle window / fullscreen mode |

Touch is also supported: swipe on the map to move, and the on-screen D-pad works as well.

## Gameplay

- **Items**: potion (restores health), sword (drives monsters away), key (opens the castle), Magic Crystal (win condition).
- **Dangers**: swamp (damages over time), monster (deals damage without a sword, is driven away with one).
- **Commands**: use the keyboard, or type text commands in the input box (e.g. `east`, `take`, `use 治愈药水`).
- **Win / lose**: picking up the crystal wins; reaching zero health loses.

## Technical highlights

- **Classes & modules**: `Game`, `World`, `Location`, `Item`, `Danger`, `Player`, all as ES modules.
- **Arrow functions**: item action maps (`{ actionName: (ctx) => ... }`).
- **Generators & iterators**: a `function*` generator in `mapGenerator.js`, plus `enumerate` / `shuffled` helpers.
- **Functional programming**: `map` / `filter` / `reduce` for statistics and rendering.
- **Pseudo-random map**: the same seed produces the same map, which makes testing reproducible.
- **DOM interaction**: keyboard listeners, touch swipe, fullscreen toggle (Fullscreen API).
- **CSS**: all styles live in `src/styles.css` with no inline styles; includes 5 CSS animations.
- **Persistence**: save / load progress via `localStorage` (`SaveManager`).
- **Graphics**: the welcome illustration was created with a generative AI tool.

## Project structure

```
adventure-game/
├── index.html                 # welcome / game / end screens
├── public/assets/hero.jpg     # welcome illustration
├── src/
│   ├── main.js                # entry: wires DOM to game logic
│   ├── styles.css             # all styles and animations
│   ├── core/                  # pure logic (no DOM, easily testable)
│   │   ├── Game.js            # game class: state, flow, commands, win/lose
│   │   ├── World.js           # world class: 2D Location map
│   │   ├── Location.js        # location: coordinates, items, danger, description
│   │   ├── Item.js            # item: name, description, action map
│   │   ├── Danger.js          # danger: name, description, effect function
│   │   ├── Player.js          # player: position, inventory, health
│   │   ├── mapGenerator.js    # PRNG + generator function
│   │   ├── definitions.js     # item / danger factories
│   │   └── SaveManager.js     # localStorage save / load
│   └── ui/dom.js              # DOM rendering, keyboard / touch / fullscreen
├── test/                      # vitest unit tests (9 files)
├── vite.config.js             # Vite / Vitest config
├── eslint.config.js           # ESLint (flat config)
└── .github/workflows/deploy.yml  # GitHub Pages auto-deploy
```

## Run locally

```bash
npm install       # install dependencies (first time)
npm run dev       # start the dev server, then open the printed URL
```

## Tests & code quality

```bash
npm test          # run vitest unit tests (about 70 cases)
npm run lint      # ESLint check (0 errors, 0 warnings)
npm run build     # production build, output to dist/
```

Tests cover every core class and function, and mock Web APIs with **jsdom** (e.g. `localStorage`, the Fullscreen API, touch events).

## Deployment

After pushing to `main`, GitHub Actions builds and publishes to GitHub Pages automatically:

```
https://gushenle.github.io/magic-forest-quest/
```

The `base` in `vite.config.js` is injected by CI as the repository name, so assets never 404 under the sub-path.
