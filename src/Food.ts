import * as PIXI from 'pixi.js';

export class Food {
  private graphics: PIXI.Graphics;
  private position: { x: number; y: number };
  private capacity: number;
  private readonly maxCapacity: number = 100;
  private readonly size: number = 8;
  private readonly regenerationRate: number = 0.1;
  private isBeingConsumed: boolean = false;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.capacity = this.maxCapacity;
    this.graphics = new PIXI.Graphics();
    this.graphics.interactive = false;
    this.draw();
    this.updateGraphicsPosition();
  }

  private draw(): void {
    this.graphics.clear();

    const capacityPercent = this.capacity / this.maxCapacity;
    const alpha = Math.max(0.3, capacityPercent);
    const currentSize = this.size * Math.max(0.5, capacityPercent);

    const greenIntensity = Math.floor(200 * capacityPercent);
    const color = (0 << 16) | (greenIntensity << 8) | 0;

    this.graphics.beginFill(color, alpha);
    this.graphics.moveTo(0, -currentSize);
    this.graphics.lineTo(currentSize * 0.866, currentSize * 0.5);
    this.graphics.lineTo(-currentSize * 0.866, currentSize * 0.5);
    this.graphics.closePath();
    this.graphics.endFill();

    this.graphics.lineStyle(1, 0x00ff00, alpha);
    this.graphics.moveTo(0, -currentSize);
    this.graphics.lineTo(currentSize * 0.866, currentSize * 0.5);
    this.graphics.lineTo(-currentSize * 0.866, currentSize * 0.5);
    this.graphics.closePath();
    this.graphics.lineStyle(0);
  }

  private updateGraphicsPosition(): void {
    this.graphics.position.set(this.position.x, this.position.y);
  }

  public update(): void {
    if (this.capacity < this.maxCapacity) {
      this.capacity = Math.min(this.maxCapacity, this.capacity + this.regenerationRate);
      this.draw();
    }
  }

  public consume(amount: number): number {
    const actualAmount = Math.min(amount, this.capacity);
    this.capacity = Math.max(0, this.capacity - actualAmount);
    this.draw();
    return actualAmount;
  }

  public getPosition(): { x: number; y: number } {
    return this.position;
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public isEmpty(): boolean {
    return this.capacity <= 0;
  }

  public getGraphics(): PIXI.Graphics {
    return this.graphics;
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
