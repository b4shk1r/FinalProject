import * as PIXI from 'pixi.js';
import { DNA } from './DNA';

export class Prey {
  private graphics: PIXI.Graphics;
  private healthBar: PIXI.Graphics;
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
  private readonly hungerRate: number = 0.05;
  private readonly starvationDamage: number = 0.1;
  private thirst: number = 0;
  private readonly maxThirst: number = 100;
  private readonly thirstRate: number = 0.07;
  private readonly dehydrationDamage: number = 0.15;
  private energy: number = 100;
  private readonly maxEnergy: number = 100;
  private energyConsumptionRate: number;
  private isDead: boolean = false;
  private isSelected: boolean = false;

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

    const sizeMultiplier = this.dna.getSizeMultiplier();
    const speedMultiplier = this.dna.getSpeedMultiplier();
    this.energyConsumptionRate = 0.02 * sizeMultiplier * speedMultiplier;

    this.graphics = new PIXI.Graphics();
    this.graphics.interactive = true;
    this.graphics.cursor = 'pointer';
    this.healthBar = new PIXI.Graphics();
    this.selectionCircle = new PIXI.Graphics();
    this.graphics.addChild(this.selectionCircle);
    this.graphics.addChild(this.healthBar);
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
    this.drawHealthBar();
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

  private drawHealthBar(): void {
    this.healthBar.clear();

    if (this.isDead) return;

    const barWidth = this.size * 2;
    const barHeight = 2.5;
    const barSpacing = 1;
    const startY = -this.size - 6;

    const healthPercent = this.health / this.maxHealth;
    this.healthBar.beginFill(0x000000, 0.5);
    this.healthBar.drawRect(-barWidth / 2, startY, barWidth, barHeight);
    this.healthBar.endFill();
    this.healthBar.beginFill(0xff0000);
    this.healthBar.drawRect(-barWidth / 2, startY, barWidth * healthPercent, barHeight);
    this.healthBar.endFill();

    const thirstPercent = this.thirst / this.maxThirst;
    const thirstBarY = startY + barHeight + barSpacing;
    this.healthBar.beginFill(0x000000, 0.5);
    this.healthBar.drawRect(-barWidth / 2, thirstBarY, barWidth, barHeight);
    this.healthBar.endFill();
    this.healthBar.beginFill(0x0088ff);
    this.healthBar.drawRect(-barWidth / 2, thirstBarY, barWidth * thirstPercent, barHeight);
    this.healthBar.endFill();

    const hungerPercent = this.hunger / this.maxHunger;
    const hungerBarY = thirstBarY + barHeight + barSpacing;
    this.healthBar.beginFill(0x000000, 0.5);
    this.healthBar.drawRect(-barWidth / 2, hungerBarY, barWidth, barHeight);
    this.healthBar.endFill();
    this.healthBar.beginFill(0x00ff00);
    this.healthBar.drawRect(-barWidth / 2, hungerBarY, barWidth * hungerPercent, barHeight);
    this.healthBar.endFill();

    const energyPercent = this.energy / this.maxEnergy;
    const energyBarY = hungerBarY + barHeight + barSpacing;
    this.healthBar.beginFill(0x000000, 0.5);
    this.healthBar.drawRect(-barWidth / 2, energyBarY, barWidth, barHeight);
    this.healthBar.endFill();
    this.healthBar.beginFill(0xffff00);
    this.healthBar.drawRect(-barWidth / 2, energyBarY, barWidth * energyPercent, barHeight);
    this.healthBar.endFill();
  }

  public update(): void {
    if (this.isDead) return;

    this.updateHunger();
    this.updateThirst();
    this.updateEnergy();
    this.updateHealth();
    this.updateWanderBehavior();
    this.move();
    this.stayInBounds();
    this.updateGraphicsPosition();
    this.draw();
  }

  private updateEnergy(): void {
    if (this.energy > 0) {
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
