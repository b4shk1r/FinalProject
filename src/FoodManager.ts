import * as PIXI from 'pixi.js';
import { Food } from './Food';

export class FoodManager {
  private container: PIXI.Container;
  private foodList: Food[] = [];
  private worldBounds: { width: number; height: number };

  constructor(worldBounds: { width: number; height: number }) {
    this.container = new PIXI.Container();
    this.worldBounds = worldBounds;
  }

  public spawnFoodClusters(clusterCount: number, foodPerCluster: number): void {
    for (let i = 0; i < clusterCount; i++) {
      const clusterX = Math.random() * this.worldBounds.width;
      const clusterY = Math.random() * this.worldBounds.height;
      const clusterRadius = 30 + Math.random() * 40;

      for (let j = 0; j < foodPerCluster; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * clusterRadius;
        const x = clusterX + Math.cos(angle) * distance;
        const y = clusterY + Math.sin(angle) * distance;

        if (x >= 0 && x <= this.worldBounds.width && y >= 0 && y <= this.worldBounds.height) {
          const food = new Food(x, y);
          this.foodList.push(food);
          this.container.addChild(food.getGraphics());
        }
      }
    }
  }

  public update(): void {
    for (const food of this.foodList) {
      food.update();
    }
  }

  public findNearestFood(position: { x: number; y: number }): Food | null {
    let nearest: Food | null = null;
    let minDistance = Infinity;

    for (const food of this.foodList) {
      if (food.getCapacity() > 0) {
        const foodPos = food.getPosition();
        const dx = foodPos.x - position.x;
        const dy = foodPos.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          nearest = food;
        }
      }
    }

    return nearest;
  }

  public getFoodAt(position: { x: number; y: number }, radius: number): Food | null {
    for (const food of this.foodList) {
      const foodPos = food.getPosition();
      const dx = foodPos.x - position.x;
      const dy = foodPos.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius && food.getCapacity() > 0) {
        return food;
      }
    }
    return null;
  }

  public getContainer(): PIXI.Container {
    return this.container;
  }

  public destroy(): void {
    for (const food of this.foodList) {
      food.destroy();
    }
    this.foodList = [];
    this.container.destroy();
  }
}
