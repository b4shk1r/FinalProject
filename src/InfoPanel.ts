import { Prey } from './Prey';

export class InfoPanel {
  private container: HTMLDivElement;
  private selectedPrey: Prey | null = null;

  constructor() {
    this.container = this.createUI();
    document.body.appendChild(this.container);
  }

  private createUI(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'info-panel';
    container.style.position = 'absolute';
    container.style.top = '150px';
    container.style.left = '10px';
    container.style.width = '300px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    container.style.padding = '15px';
    container.style.borderRadius = '8px';
    container.style.color = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '13px';
    container.style.zIndex = '1000';
    container.style.userSelect = 'none';
    container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
    container.style.display = 'none';
    container.style.maxHeight = 'calc(100vh - 160px)';
    container.style.overflowY = 'auto';

    const title = document.createElement('div');
    title.textContent = 'Entity Information';
    title.style.marginBottom = '12px';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '15px';
    title.style.borderBottom = '2px solid #444';
    title.style.paddingBottom = '8px';
    container.appendChild(title);

    const content = document.createElement('div');
    content.id = 'info-content';
    container.appendChild(content);

    return container;
  }

  public updateInfo(prey: Prey | null): void {
    this.selectedPrey = prey;

    if (!prey) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'block';
    this.refresh();
  }

  public refresh(): void {
    if (!this.selectedPrey) return;

    const content = document.getElementById('info-content');
    if (!content) return;

    const prey = this.selectedPrey;
    const dna = prey.getDNA();
    const dominantChromosome = dna.getDominantChromosome();
    const recessiveChromosome = dna.getRecessiveChromosome();

    content.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="font-weight: bold; color: #ffaa00; margin-bottom: 6px;">Basic Info</div>
        <div style="margin-left: 10px; line-height: 1.6;">
          <div><span style="color: #aaa;">Gender:</span> <span style="color: ${prey.getGender() === 'male' ? '#4080ff' : '#ff69b4'};">${prey.getGender() === 'male' ? '♂ Male' : '♀ Female'}</span></div>
          <div><span style="color: #aaa;">Size:</span> ${this.formatValue(prey.getSize())}</div>
          <div><span style="color: #aaa;">Speed:</span> ${this.formatValue(prey.getSpeed())}</div>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="font-weight: bold; color: #ffaa00; margin-bottom: 6px;">Status</div>
        <div style="margin-left: 10px; line-height: 1.6;">
          <div><span style="color: #aaa;">Health:</span> <span style="color: #ff6666;">${this.formatValue(prey.getHealth())} / ${this.formatValue(prey.getMaxHealth())}</span></div>
          <div><span style="color: #aaa;">Energy:</span> <span style="color: #ffff66;">${this.formatValue(prey.getEnergy())} / 100</span></div>
          <div><span style="color: #aaa;">Hunger:</span> <span style="color: #66ff66;">${this.formatValue(prey.getHunger())} / 100</span></div>
          <div><span style="color: #aaa;">Thirst:</span> <span style="color: #6666ff;">${this.formatValue(prey.getThirst())} / 100</span></div>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="font-weight: bold; color: #ffaa00; margin-bottom: 6px;">DNA Traits</div>
        <div style="margin-left: 10px; line-height: 1.6;">
          <div><span style="color: #aaa;">Attractiveness:</span> ${this.formatValue(prey.getAttractiveness())}</div>
          <div style="margin-top: 4px;"><span style="color: #aaa;">Size Multiplier:</span> ${this.formatValue(dna.getSizeMultiplier())}</div>
          <div><span style="color: #aaa;">Speed Multiplier:</span> ${this.formatValue(dna.getSpeedMultiplier())}</div>
          <div><span style="color: #aaa;">Health Multiplier:</span> ${this.formatValue(dna.getHealthMultiplier())}</div>
        </div>
      </div>

      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #ffaa00; margin-bottom: 8px;">Chromosomes</div>
        <div style="margin-left: 10px;">
          ${this.renderChromosomeComparison(dominantChromosome, recessiveChromosome)}
        </div>
      </div>
    `;
  }

  private renderChromosomeComparison(dominant: any, recessive: any): string {
    const traits = [
      { key: 'size', label: 'Size', color: '#ff9966' },
      { key: 'speed', label: 'Speed', color: '#66ccff' },
      { key: 'health', label: 'Health', color: '#ff6666' },
      { key: 'attractiveness', label: 'Attract', color: '#ff66ff' },
      { key: 'gender', label: 'Gender', color: '#ffff66' }
    ];

    return traits.map(trait => {
      const domValue = dominant[trait.key];
      const recValue = recessive[trait.key];

      if (trait.key === 'gender') {
        return `
          <div style="margin-bottom: 8px;">
            <div style="font-size: 11px; color: ${trait.color}; margin-bottom: 3px;">${trait.label}</div>
            <div style="display: flex; gap: 4px;">
              <div style="flex: 1; background: rgba(255,255,255,0.1); padding: 4px 6px; border-radius: 3px; font-size: 11px; border: 2px solid #ffaa00;">
                <span style="color: #ffaa00;">D:</span> ${domValue}
              </div>
              <div style="flex: 1; background: rgba(255,255,255,0.05); padding: 4px 6px; border-radius: 3px; font-size: 11px; border: 1px solid #666;">
                <span style="color: #999;">R:</span> ${recValue}
              </div>
            </div>
          </div>
        `;
      }

      const domWidth = ((domValue - 0.3) / 1.2) * 100;
      const recWidth = ((recValue - 0.3) / 1.2) * 100;

      return `
        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; color: ${trait.color}; margin-bottom: 3px;">${trait.label}</div>
          <div style="display: flex; gap: 4px; align-items: center;">
            <div style="flex: 1;">
              <div style="background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; height: 16px; position: relative; border: 2px solid #ffaa00;">
                <div style="background: ${trait.color}; width: ${domWidth}%; height: 100%;"></div>
                <span style="position: absolute; left: 4px; top: 50%; transform: translateY(-50%); font-size: 10px; color: white; font-weight: bold;">D: ${this.formatValue(domValue)}</span>
              </div>
            </div>
            <div style="flex: 1;">
              <div style="background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; height: 16px; position: relative; border: 1px solid #666;">
                <div style="background: ${trait.color}; opacity: 0.5; width: ${recWidth}%; height: 100%;"></div>
                <span style="position: absolute; left: 4px; top: 50%; transform: translateY(-50%); font-size: 10px; color: #ccc;">R: ${this.formatValue(recValue)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  private formatValue(value: number): string {
    return value.toFixed(2);
  }

  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
