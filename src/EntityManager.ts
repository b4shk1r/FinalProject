import * as PIXI from 'pixi.js';
import { Prey } from './Prey';
import { FoodManager } from './FoodManager';
import { WaterManager } from './WaterManager';

export class EntityManager {
  private container: PIXI.Container;
  private preyList: Prey[] = [];
  private worldBounds: { width: number; height: number };
  private selectedPrey: Prey | null = null;
  private onSelectionChange?: (prey: Prey | null) => void;
  private foodManager: FoodManager | null = null;
  private waterManager: WaterManager | null = null;

  constructor(worldBounds: { width: number; height: number }) {
    this.container = new PIXI.Container();
    this.worldBounds = worldBounds;
  }

  public setFoodManager(foodManager: FoodManager): void {
    this.foodManager = foodManager;
  }

  public setWaterManager(waterManager: WaterManager): void {
    this.waterManager = waterManager;
  }

  public setSelectionChangeCallback(callback: (prey: Prey | null) => void): void {
    this.onSelectionChange = callback;
  }

  public spawnPrey(count: number): void {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.worldBounds.width;
      const y = Math.random() * this.worldBounds.height;

      const prey = new Prey(x, y, this.worldBounds);
      this.preyList.push(prey);
      this.container.addChild(prey.getGraphics());

      prey.getGraphics().on('click', () => this.selectPrey(prey));
      prey.getGraphics().on('tap', () => this.selectPrey(prey));
    }
  }

  private selectPrey(prey: Prey): void {
    if (this.selectedPrey) {
      this.selectedPrey.setSelected(false);
    }

    this.selectedPrey = prey;
    prey.setSelected(true);

    if (this.onSelectionChange) {
      this.onSelectionChange(prey);
    }
  }

  public getSelectedPrey(): Prey | null {
    return this.selectedPrey;
  }

  public update(): void {
    for (const prey of this.preyList) {
      let nearestFood = null;
      let nearestWater = null;

      if (this.foodManager) {
        nearestFood = this.foodManager.findNearestFood(prey.getPosition());
      }

      if (this.waterManager) {
        nearestWater = this.waterManager.findNearestWater(prey.getPosition());
      }

      prey.update(nearestFood, nearestWater);
    }

    this.removeDeadPrey();
  }

  private removeDeadPrey(): void {
    const deadPrey = this.preyList.filter(prey => prey.getIsDead());

    for (const prey of deadPrey) {
      if (this.selectedPrey === prey) {
        this.selectedPrey = null;
        if (this.onSelectionChange) {
          this.onSelectionChange(null);
        }
      }
      this.container.removeChild(prey.getGraphics());
      prey.destroy();
    }

    this.preyList = this.preyList.filter(prey => !prey.getIsDead());
  }

  public getContainer(): PIXI.Container {
    return this.container;
  }

  public getPreyCount(): number {
    return this.preyList.length;
  }

  public destroy(): void {
    for (const prey of this.preyList) {
      prey.destroy();
    }
    this.preyList = [];
    this.container.destroy();
  }
}
