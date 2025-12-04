import * as PIXI from 'pixi.js';
import { DNA } from './DNA';
import { Food } from './Food';
import { Water } from './Water';

export class Prey {
  private graphics: PIXI.Graphics;
  private selectionCircle: PIXI.Graphics;
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private readonly baseSpeed: number = 1;
  private speed: number;
  private readonly baseSize: number = 8;
  private size: number;
  private wanderAngle: number = 0;
  private wanderTimer: number = 0;
  private readonly wanderChangeInterval: number = 60;
  private worldBounds: { width: number; height: number };

  private dna: DNA;
  private health: number;
  private maxHealth: number;
  private hunger: number = 0;
  private readonly maxHunger: number = 100;
  private readonly hungerRate: number = 0.03;
  private readonly starvationDamage: number = 0.1;
  private thirst: number = 0;
  private readonly maxThirst: number = 100;
  private readonly thirstRate: number = 0.04;
  private readonly dehydrationDamage: number = 0.15;
  private readonly drinkingRate: number = 15;
  private energy: number = 100;
  private readonly maxEnergy: number = 100;
  private energyConsumptionRate: number;
  private isDead: boolean = false;
  private isSelected: boolean = false;

  private targetFood: Food | null = null;
  private targetWater: Water | null = null;
  private readonly eatingRate: number = 10;
  private readonly baseVisionRange: number = 80;
  private visionRange: number;

  private readonly criticalThreshold: number = 70;
  private readonly satisfiedThreshold: number = 20;

  constructor(x: number, y: number, worldBounds: { width: number; height: number }, dna?: DNA) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.worldBounds = worldBounds;
    this.wanderAngle = Math.random() * Math.PI * 2;

    this.dna = dna || new DNA();

    this.maxHealth = 100 * this.dna.getHealthMultiplier();
    this.health = this.maxHealth;
    this.speed = this.baseSpeed * this.dna.getSpeedMultiplier();
    this.size = this.baseSize * this.dna.getSizeMultiplier();
    this.visionRange = this.baseVisionRange * this.dna.getVisionMultiplier();

    const sizeMultiplier = this.dna.getSizeMultiplier();
    const speedMultiplier = this.dna.getSpeedMultiplier();
    this.energyConsumptionRate = 0.02 * sizeMultiplier * speedMultiplier;

    this.graphics = new PIXI.Graphics();
    this.graphics.interactive = true;
    this.graphics.cursor = 'pointer';
    this.selectionCircle = new PIXI.Graphics();
    this.graphics.addChild(this.selectionCircle);
    this.draw();
    this.updateGraphicsPosition();
  }

  private draw(): void {
    this.graphics.clear();

    const bodyColor = this.isDead ? 0x4a4a4a : this.dna.getColorFromGenes();

    this.graphics.beginFill(bodyColor);
    this.graphics.drawCircle(0, 0, this.size);
    this.graphics.endFill();

    if (!this.isDead) {
      const eyeColor = 0xa0522d;
      this.graphics.beginFill(eyeColor);
      this.graphics.drawCircle(-2, -2, 2);
      this.graphics.drawCircle(2, -2, 2);
      this.graphics.endFill();

      this.drawGenderIndicator();
    }

    this.drawSelectionCircle();
  }

  private drawSelectionCircle(): void {
    this.selectionCircle.clear();

    if (this.isSelected && !this.isDead) {
      this.selectionCircle.lineStyle(2, 0xffff00, 1);
      this.selectionCircle.drawCircle(0, 0, this.size + 4);
      this.selectionCircle.lineStyle(0);
    }
  }

  private drawGenderIndicator(): void {
    const gender = this.dna.getGender();
    const indicatorSize = this.size * 0.35;
    const offsetY = this.size * 0.5;

    if (gender === 'male') {
      this.graphics.lineStyle(1.5, 0x4080ff, 1);
      this.graphics.drawCircle(0, offsetY, indicatorSize);
      this.graphics.moveTo(indicatorSize * 0.7, offsetY - indicatorSize * 0.7);
      this.graphics.lineTo(indicatorSize * 1.2, offsetY - indicatorSize * 1.2);
      this.graphics.moveTo(indicatorSize * 1.2, offsetY - indicatorSize * 1.2);
      this.graphics.lineTo(indicatorSize * 1.2, offsetY - indicatorSize * 0.7);
      this.graphics.moveTo(indicatorSize * 1.2, offsetY - indicatorSize * 1.2);
      this.graphics.lineTo(indicatorSize * 0.7, offsetY - indicatorSize * 1.2);
    } else {
      this.graphics.lineStyle(1.5, 0xff69b4, 1);
      this.graphics.drawCircle(0, offsetY, indicatorSize);
      this.graphics.moveTo(0, offsetY + indicatorSize);
      this.graphics.lineTo(0, offsetY + indicatorSize * 1.5);
      this.graphics.moveTo(-indicatorSize * 0.5, offsetY + indicatorSize * 1.3);
      this.graphics.lineTo(indicatorSize * 0.5, offsetY + indicatorSize * 1.3);
    }

    this.graphics.lineStyle(0);
  }

  public update(nearestFood?: Food | null, nearestWater?: Water | null): void {
    if (this.isDead) return;

    this.updateHunger();
    this.updateThirst();
    this.updateEnergy();
    this.updateHealth();
    this.updateBehavior(nearestFood, nearestWater);
    this.move();
    this.stayInBounds();
    this.updateGraphicsPosition();
    this.draw();
  }

  private updateBehavior(nearestFood?: Food | null, nearestWater?: Water | null): void {
    if (this.energy <= 0) {
      this.velocity.x = 0;
      this.velocity.y = 0;
      return;
    }

    // Determine if needs are critical or satisfied
    const hungerCritical = this.hunger >= this.criticalThreshold;
    const thirstCritical = this.thirst >= this.criticalThreshold;
    const hungerSatisfied = this.hunger <= this.satisfiedThreshold;
    const thirstSatisfied = this.thirst <= this.satisfiedThreshold;

    // CRITICAL PRIORITY: If either need is critical, prioritize the most critical one
    if (hungerCritical || thirstCritical) {
      // Choose the more critical need
      if (hungerCritical && thirstCritical) {
        // Both critical - choose the worse one
        if (this.hunger >= this.thirst) {
          if (this.trySeekFood(nearestFood)) return;
          if (this.trySeekWater(nearestWater)) return;
        } else {
          if (this.trySeekWater(nearestWater)) return;
          if (this.trySeekFood(nearestFood)) return;
        }
      } else if (hungerCritical) {
        if (this.trySeekFood(nearestFood)) return;
        // If can't find food, at least try water
        if (this.trySeekWater(nearestWater)) return;
      } else if (thirstCritical) {
        if (this.trySeekWater(nearestWater)) return;
        // If can't find water, at least try food
        if (this.trySeekFood(nearestFood)) return;
      }
    }
    // NORMAL PRIORITY: Balance both needs
    else if (!hungerSatisfied && !thirstSatisfied) {
      // Both needs present - alternate based on which is higher
      if (this.hunger > this.thirst) {
        if (this.trySeekFood(nearestFood)) return;
        if (this.trySeekWater(nearestWater)) return;
      } else {
        if (this.trySeekWater(nearestWater)) return;
        if (this.trySeekFood(nearestFood)) return;
      }
    }
    // SINGLE NEED: Only one need active
    else if (!hungerSatisfied) {
      if (this.trySeekFood(nearestFood)) return;
    } else if (!thirstSatisfied) {
      if (this.trySeekWater(nearestWater)) return;
    }

    // Nothing to do - wander
    this.targetFood = null;
    this.targetWater = null;
    this.updateWanderBehavior();
  }

  private trySeekFood(nearestFood?: Food | null): boolean {
    if (!nearestFood || nearestFood.getCapacity() <= 0) return false;

    const foodPos = nearestFood.getPosition();
    const dx = foodPos.x - this.position.x;
    const dy = foodPos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.visionRange) {
      this.seekFood(nearestFood);
      return true;
    }
    return false;
  }

  private trySeekWater(nearestWater?: Water | null): boolean {
    if (!nearestWater) return false;

    const waterPos = nearestWater.getPosition();
    const dx = waterPos.x - this.position.x;
    const dy = waterPos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.visionRange) {
      this.seekWater(nearestWater);
      return true;
    }
    return false;
  }

  private seekWater(water: Water): void {
    this.targetWater = water;
    const waterPos = water.getPosition();
    const dx = waterPos.x - this.position.x;
    const dy = waterPos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if already at water
    if (water.isPointInside(this.position.x, this.position.y)) {
      const amountNeeded = this.thirst;
      const drunk = Math.min(this.drinkingRate, amountNeeded);
      this.thirst = Math.max(0, this.thirst - drunk);
      this.velocity.x = 0;
      this.velocity.y = 0;
    } else {
      const angle = Math.atan2(dy, dx);
      this.velocity.x = Math.cos(angle) * this.speed;
      this.velocity.y = Math.sin(angle) * this.speed;
    }
  }

  private seekFood(food: Food): void {
    this.targetFood = food;
    const foodPos = food.getPosition();
    const dx = foodPos.x - this.position.x;
    const dy = foodPos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.size + 5) {
      const amountNeeded = this.hunger;
      const consumed = food.consume(Math.min(this.eatingRate, amountNeeded));
      this.hunger = Math.max(0, this.hunger - consumed);
      this.velocity.x = 0;
      this.velocity.y = 0;
    } else {
      const angle = Math.atan2(dy, dx);
      this.velocity.x = Math.cos(angle) * this.speed;
      this.velocity.y = Math.sin(angle) * this.speed;
    }
  }

  private updateEnergy(): void {
    // Regenerate energy when needs are satisfied
    const hungerSatisfied = this.hunger <= this.satisfiedThreshold;
    const thirstSatisfied = this.thirst <= this.satisfiedThreshold;

    if (hungerSatisfied && thirstSatisfied) {
      // Both needs satisfied - regenerate energy faster
      this.energy = Math.min(this.maxEnergy, this.energy + 0.5);
    } else if (hungerSatisfied || thirstSatisfied) {
      // One need satisfied - regenerate energy slowly
      this.energy = Math.min(this.maxEnergy, this.energy + 0.2);
    } else {
      // Needs not satisfied - consume energy
      this.energy = Math.max(0, this.energy - this.energyConsumptionRate);
    }
  }

  private updateHunger(): void {
    this.hunger = Math.min(this.maxHunger, this.hunger + this.hungerRate);
  }

  private updateThirst(): void {
    this.thirst = Math.min(this.maxThirst, this.thirst + this.thirstRate);
  }

  private updateHealth(): void {
    let damage = 0;

    if (this.hunger >= this.maxHunger) {
      damage += this.starvationDamage;
    }

    if (this.thirst >= this.maxThirst) {
      damage += this.dehydrationDamage;
    }

    if (damage > 0) {
      this.health = Math.max(0, this.health - damage);

      if (this.health <= 0) {
        this.isDead = true;
        this.draw();
      }
    }
  }

  private updateWanderBehavior(): void {
    if (this.energy <= 0) {
      this.velocity.x = 0;
      this.velocity.y = 0;
      return;
    }

    this.wanderTimer++;

    if (this.wanderTimer >= this.wanderChangeInterval) {
      this.wanderAngle += (Math.random() - 0.5) * Math.PI * 0.5;
      this.wanderTimer = 0;
    }

    this.velocity.x = Math.cos(this.wanderAngle) * this.speed;
    this.velocity.y = Math.sin(this.wanderAngle) * this.speed;
  }

  private move(): void {
    if (this.energy > 0) {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  private stayInBounds(): void {
    const margin = this.size;

    if (this.position.x < margin) {
      this.position.x = margin;
      this.wanderAngle = Math.random() * Math.PI - Math.PI / 2;
    } else if (this.position.x > this.worldBounds.width - margin) {
      this.position.x = this.worldBounds.width - margin;
      this.wanderAngle = Math.random() * Math.PI + Math.PI / 2;
    }

    if (this.position.y < margin) {
      this.position.y = margin;
      this.wanderAngle = Math.random() * Math.PI;
    } else if (this.position.y > this.worldBounds.height - margin) {
      this.position.y = this.worldBounds.height - margin;
      this.wanderAngle = -Math.random() * Math.PI;
    }
  }

  private updateGraphicsPosition(): void {
    this.graphics.x = this.position.x;
    this.graphics.y = this.position.y;
  }

  public getGraphics(): PIXI.Graphics {
    return this.graphics;
  }

  public getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  public getIsDead(): boolean {
    return this.isDead;
  }

  public getHealth(): number {
    return this.health;
  }

  public getHunger(): number {
    return this.hunger;
  }

  public getThirst(): number {
    return this.thirst;
  }

  public getEnergy(): number {
    return this.energy;
  }

  public getDNA(): DNA {
    return this.dna;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public getSize(): number {
    return this.size;
  }

  public getGender(): 'male' | 'female' {
    return this.dna.getGender();
  }

  public getAttractiveness(): number {
    return this.dna.getAttractiveness();
  }

  public getVisionRange(): number {
    return this.visionRange;
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.draw();
  }

  public getIsSelected(): boolean {
    return this.isSelected;
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
