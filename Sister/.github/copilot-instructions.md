# AI working guide for this repo

Scope: This workspace is a tiny static web project for a birthday surprise built around an HTML5 Canvas driving game that transitions into a celebration screen. No bundler or server is required; open the HTML in a browser.

Architecture at a glance
- Two self-contained pages:
  - `index2.html` — Original “Himalayan Rider - Mountain Escape” canvas game + surprise overlay.
  - `index3.html` — New enhanced “Himalayan Rider 2 — Alpine Rush” with richer visuals, physics-y steering, nitro, weather, day-night cycle, and a celebration overlay.
- Everything (HTML, styles, JS) is inline per page. No external assets, modules, or build step.
- Canvas render loop drives the scene; DOM is used only for HUD and the celebration FX (fireworks/balloons/stars).

Key patterns and conventions
- HiDPI handling: Canvas scales using `devicePixelRatio` and `ctx.setTransform(DPR, 0, 0, DPR, 0, 0)` in `index3.html`.
- Game states: `'START' | 'RUNNING' | 'PAUSED' | 'CELEBRATION'` (index3). State gates the `requestAnimationFrame` loop.
- Input handling: Mouse/touch sets a target X; optional keyboard: ←/→/A/D to steer, Space for nitro, P to pause.
- Road perspective: Uses a normalized depth (0..1) to project lane lines and objects with a time-varying lateral offset for curvature.
- Spawns: `spawnWave()` seeds obstacles (rocks/cars) and coin arcs into arrays; positions are defined in “lane space” and projected each frame.
- Particles: Lightweight JS arrays for coin/crash sparkles, nitro trail, rain/snow droplets, and speed lines; short lifetimes, updated per frame.
- Surprise overlay: Triggered after time/distance. Renders fireworks/balloons/stars as ephemeral DOM nodes, removed via timeouts to avoid leaks.
- Visual style: Neon gradients, soft shadows, and subtle glows. Respect `.hintrc` compatibility rules (e.g., vendor-prefixed `-webkit-user-select`, `-webkit-background-clip`).

File entry points to know
- `index3.html` script sections:
  - Canvas setup and `resize()` with DPR handling.
  - `world` object: speed, nitro, multiplier, weather, day-night, curve, distance goal.
  - `bike` object: position, lateral physics, steering angle.
  - Render pipeline per frame: `drawBackground()` → `drawRoad()` → `updateSpawns()` → `drawObjects()` → `drawParticles()` → `drawBike()` → `drawWeatherFx()` → `drawSpeedLines()` → `drawHUD()`.
  - Celebration: `celebrate()` swaps to the overlay and emits DOM FX bursts.

Developer workflows
- Run locally: Double-click `index3.html` or serve the folder with a simple static server. No npm/pip required.
- Lint constraints: `.hintrc` ignores `backdrop-filter` but expects cross-browser CSS where applicable. Avoid inline `style` when possible and add WebKit fallbacks for `user-select` and `background-clip`.
- Quick manual test:
  - Start → gameplay should show curved road, coins/obstacles, nitro bar, HUD values updating.
  - Controls: Mouse/touch or ←/→; Space boosts (consumes nitro, adds glow trail); P toggles pause.
  - After reaching the goal distance, the celebration overlay appears with fireworks/balloons/stars.

How to extend safely
- Add content by appending new obstacle/collectible types to the arrays and drawing branches. Keep spawn shapes in lane space and project to screen near the bottom region for collisions.
- For new effects, add ephemeral particles with capped lifetimes to avoid unbounded array growth.
- Keep state mutations centralized in `world` and render-only logic in draw functions. Prefer small helpers for projection (`screenXFromLane`) and curvature (`roadCenterOffset`).
- If adding audio, follow the pattern in `initAudio()` (lazy-init on Start due to browser autoplay policies).

Examples from the codebase
- Steering physics: `bike.lateralVel` damped towards `bike.targetX` to produce smooth leaning and clamped banking angle.
- Weather system: `updateWeather(dt)` swaps between clear/rain/snow; rain draws streaks (strokes), snow draws flakes (arcs), plus occasional lightning overlay.
- Nitro: Holding Space increases acceleration and spawns colored exhaust particles; UI meter updates via `nitroBar.style.width`.

Notes
- This is a static page repo; do not introduce a build step unless requested. If a style linter flags inline CSS, move it to the CSS block or add compatible declarations per `.hintrc`.