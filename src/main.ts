import * as PIXI from 'pixi.js';
import { GameMap } from './Map';
import { CameraController } from './CameraController';
import { EntityManager } from './EntityManager';
import { TimeManager } from './TimeManager';
import { InfoPanel } from './InfoPanel';

class Game {
  private app: PIXI.Application;
  private viewport: PIXI.Container;
  private gameMap: GameMap;
  private cameraController: CameraController;
  private entityManager: EntityManager;
  private timeManager: TimeManager;
  private infoPanel: InfoPanel;

  constructor() {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1a1a1a,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    document.getElementById('game-container')?.appendChild(this.app.view as HTMLCanvasElement);

    this.viewport = new PIXI.Container();
    this.app.stage.addChild(this.viewport);

    this.gameMap = new GameMap();
    this.viewport.addChild(this.gameMap.getContainer());

    this.entityManager = new EntityManager(this.gameMap.getWorldBounds());
    this.viewport.addChild(this.entityManager.getContainer());

    this.infoPanel = new InfoPanel();
    this.entityManager.setSelectionChangeCallback((prey) => {
      this.infoPanel.updateInfo(prey);
    });

    this.entityManager.spawnPrey(20);

    this.cameraController = new CameraController(
      this.viewport,
      this.gameMap.getWorldBounds(),
      { width: window.innerWidth, height: window.innerHeight }
    );

    this.timeManager = new TimeManager();

    this.centerCamera();
    this.setupResize();
    this.start();
  }

  private centerCamera(): void {
    const bounds = this.gameMap.getWorldBounds();
    this.viewport.x = (window.innerWidth - bounds.width) / 2;
    this.viewport.y = (window.innerHeight - bounds.height) / 2;
  }

  private setupResize(): void {
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    });
  }

  private start(): void {
    this.app.ticker.add(() => {
      this.update();
    });
  }

  private update(): void {
    this.cameraController.update();

    const timeScale = this.timeManager.getTimeScale();

    for (let i = 0; i < timeScale; i++) {
      this.entityManager.update();
    }

    if (timeScale > 0 && timeScale < 1) {
      if (Math.random() < timeScale) {
        this.entityManager.update();
      }
    }
  }
}

new Game();
