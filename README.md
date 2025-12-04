# Evolution Life Sim

A PixiJS-based TypeScript evolution life simulation game with RTS-style camera controls.

## Features

- **Interactive Map**: 40x40 tile-based map with grass terrain
- **RTS Camera Controls**:
  - Click and drag to pan the camera
  - WASD keys for keyboard movement
  - Mouse wheel to zoom in/out (0.3x to 2.5x zoom)
  - Touch support for mobile devices

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start a development server at `http://localhost:3000` and automatically open it in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
FinalProject/
├── src/
│   ├── main.ts              # Main entry point and game initialization
│   ├── Map.ts               # Map rendering system
│   └── CameraController.ts  # RTS-style camera controls
├── index.html               # HTML entry point
├── style.css                # Global styles
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite bundler configuration
```

## Controls

- **Pan**:
  - Click and drag with mouse
  - WASD keys (W=up, A=left, S=down, D=right)
- **Zoom**: Mouse wheel up/down
- **Mobile**: Touch and drag to pan

## Next Steps

This is the foundation for the evolution life sim. Future additions will include:
- Creatures with AI behaviors
- Evolution mechanics
- Food sources and resources
- Genetics and reproduction system
