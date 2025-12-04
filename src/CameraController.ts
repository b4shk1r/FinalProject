import * as PIXI from 'pixi.js';

export class CameraController {
  private viewport: PIXI.Container;
  private isDragging: boolean = false;
  private lastPosition: { x: number; y: number } = { x: 0, y: 0 };
  private readonly minZoom: number = 0.3;
  private readonly maxZoom: number = 2.5;
  private readonly zoomSpeed: number = 0.1;
  private worldBounds: { width: number; height: number };
  private screenBounds: { width: number; height: number };
  private keysPressed: Set<string> = new Set();
  private readonly keyboardSpeed: number = 5;

  constructor(
    viewport: PIXI.Container,
    worldBounds: { width: number; height: number },
    screenBounds: { width: number; height: number }
  ) {
    this.viewport = viewport;
    this.worldBounds = worldBounds;
    this.screenBounds = screenBounds;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

    window.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.onTouchEnd.bind(this));

    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.lastPosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastPosition.x;
    const deltaY = event.clientY - this.lastPosition.y;

    this.viewport.x += deltaX;
    this.viewport.y += deltaY;

    this.clampPosition();

    this.lastPosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseUp(): void {
    this.isDragging = false;
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const worldPosBeforeZoom = {
      x: (mouseX - this.viewport.x) / this.viewport.scale.x,
      y: (mouseY - this.viewport.y) / this.viewport.scale.y
    };

    const zoomDelta = event.deltaY > 0 ? -this.zoomSpeed : this.zoomSpeed;
    const newScale = Math.max(
      this.minZoom,
      Math.min(this.maxZoom, this.viewport.scale.x + zoomDelta)
    );

    this.viewport.scale.set(newScale);

    const worldPosAfterZoom = {
      x: (mouseX - this.viewport.x) / this.viewport.scale.x,
      y: (mouseY - this.viewport.y) / this.viewport.scale.y
    };

    this.viewport.x += (worldPosAfterZoom.x - worldPosBeforeZoom.x) * this.viewport.scale.x;
    this.viewport.y += (worldPosAfterZoom.y - worldPosBeforeZoom.y) * this.viewport.scale.y;

    this.clampPosition();
  }

  private onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      this.isDragging = true;
      this.lastPosition = { x: touch.clientX, y: touch.clientY };
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 1 && this.isDragging) {
      event.preventDefault();
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.lastPosition.x;
      const deltaY = touch.clientY - this.lastPosition.y;

      this.viewport.x += deltaX;
      this.viewport.y += deltaY;

      this.clampPosition();

      this.lastPosition = { x: touch.clientX, y: touch.clientY };
    }
  }

  private onTouchEnd(): void {
    this.isDragging = false;
  }

  private onKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
      this.keysPressed.add(key);
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.keysPressed.delete(key);
  }

  public update(): void {
    if (this.keysPressed.size === 0) return;

    let deltaX = 0;
    let deltaY = 0;

    if (this.keysPressed.has('w')) deltaY += this.keyboardSpeed;
    if (this.keysPressed.has('s')) deltaY -= this.keyboardSpeed;
    if (this.keysPressed.has('a')) deltaX += this.keyboardSpeed;
    if (this.keysPressed.has('d')) deltaX -= this.keyboardSpeed;

    this.viewport.x += deltaX;
    this.viewport.y += deltaY;

    this.clampPosition();
  }

  private clampPosition(): void {
    const scaledWorldWidth = this.worldBounds.width * this.viewport.scale.x;
    const scaledWorldHeight = this.worldBounds.height * this.viewport.scale.y;

    if (scaledWorldWidth <= this.screenBounds.width) {
      const centerX = (this.screenBounds.width - scaledWorldWidth) / 2;
      this.viewport.x = centerX;
    } else {
      const minX = this.screenBounds.width - scaledWorldWidth;
      this.viewport.x = Math.max(minX, Math.min(0, this.viewport.x));
    }

    if (scaledWorldHeight <= this.screenBounds.height) {
      const centerY = (this.screenBounds.height - scaledWorldHeight) / 2;
      this.viewport.y = centerY;
    } else {
      const minY = this.screenBounds.height - scaledWorldHeight;
      this.viewport.y = Math.max(minY, Math.min(0, this.viewport.y));
    }
  }

  public destroy(): void {
    window.removeEventListener('mousedown', this.onMouseDown.bind(this));
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
    window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    window.removeEventListener('wheel', this.onWheel.bind(this));
    window.removeEventListener('touchstart', this.onTouchStart.bind(this));
    window.removeEventListener('touchmove', this.onTouchMove.bind(this));
    window.removeEventListener('touchend', this.onTouchEnd.bind(this));
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
  }
}
