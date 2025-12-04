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
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.width = '280px';
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
    const content = document.getElementById('info-content');
    if (!content) return;

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

      <div style="margin-bottom: 12px;">
        <div style="font-weight: bold; color: #ffaa00; margin-bottom: 6px;">Dominant Chromosome</div>
        <div style="margin-left: 10px; line-height: 1.6; font-size: 12px;">
          <div><span style="color: #aaa;">Size:</span> ${this.formatValue(dominantChromosome.size)}</div>
          <div><span style="color: #aaa;">Speed:</span> ${this.formatValue(dominantChromosome.speed)}</div>
          <div><span style="color: #aaa;">Health:</span> ${this.formatValue(dominantChromosome.health)}</div>
          <div><span style="color: #aaa;">Attractiveness:</span> ${this.formatValue(dominantChromosome.attractiveness)}</div>
          <div><span style="color: #aaa;">Gender:</span> ${dominantChromosome.gender}</div>
        </div>
      </div>

      <div>
        <div style="font-weight: bold; color: #ffaa00; margin-bottom: 6px;">Recessive Chromosome</div>
        <div style="margin-left: 10px; line-height: 1.6; font-size: 12px;">
          <div><span style="color: #aaa;">Size:</span> ${this.formatValue(recessiveChromosome.size)}</div>
          <div><span style="color: #aaa;">Speed:</span> ${this.formatValue(recessiveChromosome.speed)}</div>
          <div><span style="color: #aaa;">Health:</span> ${this.formatValue(recessiveChromosome.health)}</div>
          <div><span style="color: #aaa;">Attractiveness:</span> ${this.formatValue(recessiveChromosome.attractiveness)}</div>
          <div><span style="color: #aaa;">Gender:</span> ${recessiveChromosome.gender}</div>
        </div>
      </div>
    `;
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
