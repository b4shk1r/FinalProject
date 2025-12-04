export class TimeManager {
  private timeScale: number = 1;
  private readonly minTimeScale: number = 0;
  private readonly maxTimeScale: number = 5;
  private isPaused: boolean = false;
  private uiContainer: HTMLDivElement;

  constructor() {
    this.uiContainer = this.createUI();
    document.body.appendChild(this.uiContainer);
    this.setupKeyboardControls();
  }

  private createUI(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'time-controls';
    container.style.position = 'absolute';
    container.style.top = '10px';
    container.style.left = '10px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    container.style.padding = '10px';
    container.style.borderRadius = '5px';
    container.style.color = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '14px';
    container.style.zIndex = '1000';
    container.style.userSelect = 'none';

    const title = document.createElement('div');
    title.textContent = 'Time Controls';
    title.style.marginBottom = '8px';
    title.style.fontWeight = 'bold';
    container.appendChild(title);

    const controlsDiv = document.createElement('div');
    controlsDiv.style.display = 'flex';
    controlsDiv.style.gap = '5px';
    controlsDiv.style.marginBottom = '8px';

    const pauseBtn = this.createButton('⏸ Pause', () => this.togglePause());
    const slowerBtn = this.createButton('◀ Slower', () => this.decreaseSpeed());
    const normalBtn = this.createButton('1x', () => this.setSpeed(1));
    const fasterBtn = this.createButton('Faster ▶', () => this.increaseSpeed());

    controlsDiv.appendChild(pauseBtn);
    controlsDiv.appendChild(slowerBtn);
    controlsDiv.appendChild(normalBtn);
    controlsDiv.appendChild(fasterBtn);
    container.appendChild(controlsDiv);

    const speedDisplay = document.createElement('div');
    speedDisplay.id = 'speed-display';
    speedDisplay.style.textAlign = 'center';
    speedDisplay.style.marginTop = '5px';
    this.updateSpeedDisplay(speedDisplay);
    container.appendChild(speedDisplay);

    const helpText = document.createElement('div');
    helpText.textContent = 'Keys: Space=Pause, -=Slower, +=Faster';
    helpText.style.fontSize = '11px';
    helpText.style.marginTop = '8px';
    helpText.style.opacity = '0.7';
    container.appendChild(helpText);

    return container;
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.padding = '5px 10px';
    button.style.backgroundColor = '#444';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '3px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '12px';

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#666';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#444';
    });

    button.addEventListener('click', onClick);

    return button;
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        this.togglePause();
      } else if (event.key === '-' || event.key === '_') {
        this.decreaseSpeed();
      } else if (event.key === '=' || event.key === '+') {
        this.increaseSpeed();
      }
    });
  }

  private updateSpeedDisplay(display?: HTMLElement): void {
    const displayElement = display || document.getElementById('speed-display');
    if (displayElement) {
      if (this.isPaused) {
        displayElement.textContent = '⏸ PAUSED';
        displayElement.style.color = '#ff6666';
      } else {
        displayElement.textContent = `Speed: ${this.timeScale.toFixed(1)}x`;
        displayElement.style.color = this.timeScale === 1 ? '#ffffff' : '#66ff66';
      }
    }
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
    this.updateSpeedDisplay();
  }

  public increaseSpeed(): void {
    if (!this.isPaused) {
      this.timeScale = Math.min(this.maxTimeScale, this.timeScale + 0.5);
      this.updateSpeedDisplay();
    }
  }

  public decreaseSpeed(): void {
    if (!this.isPaused) {
      this.timeScale = Math.max(this.minTimeScale, this.timeScale - 0.5);
      this.updateSpeedDisplay();
    }
  }

  public setSpeed(speed: number): void {
    this.timeScale = Math.max(this.minTimeScale, Math.min(this.maxTimeScale, speed));
    if (this.isPaused) {
      this.isPaused = false;
    }
    this.updateSpeedDisplay();
  }

  public getTimeScale(): number {
    return this.isPaused ? 0 : this.timeScale;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public destroy(): void {
    if (this.uiContainer && this.uiContainer.parentNode) {
      this.uiContainer.parentNode.removeChild(this.uiContainer);
    }
  }
}
