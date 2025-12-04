import * as PIXI from 'pixi.js';

export class GameMap {
  private container: PIXI.Container;
  private readonly tileSize: number = 50;
  private readonly mapWidth: number = 40;
  private readonly mapHeight: number = 40;

  constructor() {
    this.container = new PIXI.Container();
    this.generateMap();
  }

  private generateMap(): void {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const tile = this.createTile(x, y);
        this.container.addChild(tile);
      }
    }
  }

  private createTile(x: number, y: number): PIXI.Graphics {
    const tile = new PIXI.Graphics();

    const isEven = (x + y) % 2 === 0;
    const baseColor = isEven ? 0x2d5016 : 0x3a6b1e;

    tile.beginFill(baseColor);
    tile.drawRect(
      x * this.tileSize,
      y * this.tileSize,
      this.tileSize,
      this.tileSize
    );
    tile.endFill();

    tile.lineStyle(1, 0x1a3a0f, 0.3);
    tile.drawRect(
      x * this.tileSize,
      y * this.tileSize,
      this.tileSize,
      this.tileSize
    );

    return tile;
  }

  public getContainer(): PIXI.Container {
    return this.container;
  }

  public getWorldBounds(): { width: number; height: number } {
    return {
      width: this.mapWidth * this.tileSize,
      height: this.mapHeight * this.tileSize
    };
  }
}
