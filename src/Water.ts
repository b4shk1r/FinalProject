import * as PIXI from 'pixi.js';

export class Water {
  private graphics: PIXI.Graphics;
  private position: { x: number; y: number };
  private vertices: { x: number; y: number }[];
  private radius: number;

  constructor(x: number, y: number, radius: number) {
    this.position = { x, y };
    this.radius = radius;
    this.vertices = this.generateIrregularShape();
    this.graphics = new PIXI.Graphics();
    this.graphics.interactive = false;
    this.draw();
    this.updateGraphicsPosition();
  }

  private generateIrregularShape(): { x: number; y: number }[] {
    const vertices: { x: number; y: number }[] = [];
    const numPoints = 8 + Math.floor(Math.random() * 8); // 8-15 points
    const angleStep = (Math.PI * 2) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep + (Math.random() - 0.5) * angleStep * 0.5;
      const radiusVariation = this.radius * (0.5 + Math.random() * 0.7);

      const x = Math.cos(angle) * radiusVariation;
      const y = Math.sin(angle) * radiusVariation;

      vertices.push({ x, y });
    }

    return vertices;
  }

  private draw(): void {
    this.graphics.clear();

    // Draw water body with gradient-like effect
    this.graphics.beginFill(0x1e90ff, 0.6);
    this.graphics.lineStyle(2, 0x4169e1, 0.8);

    if (this.vertices.length > 0) {
      this.graphics.moveTo(this.vertices[0].x, this.vertices[0].y);

      for (let i = 1; i < this.vertices.length; i++) {
        this.graphics.lineTo(this.vertices[i].x, this.vertices[i].y);
      }

      this.graphics.closePath();
      this.graphics.endFill();
    }

    // Add lighter inner highlight for depth effect
    this.graphics.beginFill(0x87ceeb, 0.3);
    const innerScale = 0.6;
    if (this.vertices.length > 0) {
      this.graphics.moveTo(this.vertices[0].x * innerScale, this.vertices[0].y * innerScale);

      for (let i = 1; i < this.vertices.length; i++) {
        this.graphics.lineTo(this.vertices[i].x * innerScale, this.vertices[i].y * innerScale);
      }

      this.graphics.closePath();
      this.graphics.endFill();
    }
  }

  private updateGraphicsPosition(): void {
    this.graphics.position.set(this.position.x, this.position.y);
  }

  public getPosition(): { x: number; y: number } {
    return this.position;
  }

  public isPointInside(x: number, y: number): boolean {
    const localX = x - this.position.x;
    const localY = y - this.position.y;

    let inside = false;
    for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
      const xi = this.vertices[i].x;
      const yi = this.vertices[i].y;
      const xj = this.vertices[j].x;
      const yj = this.vertices[j].y;

      const intersect = ((yi > localY) !== (yj > localY)) &&
        (localX < (xj - xi) * (localY - yi) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }

    return inside;
  }

  public getGraphics(): PIXI.Graphics {
    return this.graphics;
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
