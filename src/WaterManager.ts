import * as PIXI from 'pixi.js';
import { Water } from './Water';

export class WaterManager {
  private container: PIXI.Container;
  private waterList: Water[] = [];
  private worldBounds: { width: number; height: number };

  constructor(worldBounds: { width: number; height: number }) {
    this.container = new PIXI.Container();
    this.worldBounds = worldBounds;
  }

  public spawnWaterBodies(count: number): void {
    for (let i = 0; i < count; i++) {
      const x = 50 + Math.random() * (this.worldBounds.width - 100);
      const y = 50 + Math.random() * (this.worldBounds.height - 100);
      const radius = 30 + Math.random() * 60; // 30-90 radius

      const water = new Water(x, y, radius);
      this.waterList.push(water);
      this.container.addChild(water.getGraphics());
    }
  }

  public findNearestWater(position: { x: number; y: number }): Water | null {
    let nearest: Water | null = null;
    let minDistance = Infinity;

    for (const water of this.waterList) {
      const waterPos = water.getPosition();
      const dx = waterPos.x - position.x;
      const dy = waterPos.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = water;
      }
    }

    return nearest;
  }

  public isPositionInWater(position: { x: number; y: number }): boolean {
    for (const water of this.waterList) {
      if (water.isPointInside(position.x, position.y)) {
        return true;
      }
    }
    return false;
  }

  public getContainer(): PIXI.Container {
    return this.container;
  }

  public destroy(): void {
    for (const water of this.waterList) {
      water.destroy();
    }
    this.waterList = [];
    this.container.destroy();
  }
}
