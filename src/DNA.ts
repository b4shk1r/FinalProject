export interface Chromosome {
  size: number;
  speed: number;
  health: number;
  attractiveness: number;
  vision: number;
  gender: 'male' | 'female';
}

export class DNA {
  private chromosome1: Chromosome;
  private chromosome2: Chromosome;
  private dominantChromosome: 1 | 2;

  constructor(chromosome1?: Chromosome, chromosome2?: Chromosome, dominant?: 1 | 2) {
    this.chromosome1 = chromosome1 || this.generateRandomChromosome();
    this.chromosome2 = chromosome2 || this.generateRandomChromosome();
    this.dominantChromosome = dominant || (Math.random() < 0.5 ? 1 : 2);
  }

  private generateRandomChromosome(): Chromosome {
    return {
      size: this.randomValue(0.6, 1.4),
      speed: this.randomValue(0.5, 1.5),
      health: this.randomValue(0.5, 1.5),
      attractiveness: this.randomValue(0.3, 1.0),
      vision: this.randomValue(0.5, 1.5),
      gender: Math.random() < 0.5 ? 'male' : 'female'
    };
  }

  private randomValue(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  public getDominantChromosome(): Chromosome {
    return this.dominantChromosome === 1 ? { ...this.chromosome1 } : { ...this.chromosome2 };
  }

  public getRecessiveChromosome(): Chromosome {
    return this.dominantChromosome === 1 ? { ...this.chromosome2 } : { ...this.chromosome1 };
  }

  public getSizeMultiplier(): number {
    const dominant = this.getDominantChromosome();
    const recessive = this.getRecessiveChromosome();
    return (dominant.size * 0.75) + (recessive.size * 0.25);
  }

  public getSpeedMultiplier(): number {
    const dominant = this.getDominantChromosome();
    const recessive = this.getRecessiveChromosome();
    return (dominant.speed * 0.75) + (recessive.speed * 0.25);
  }

  public getHealthMultiplier(): number {
    const dominant = this.getDominantChromosome();
    const recessive = this.getRecessiveChromosome();
    return (dominant.health * 0.75) + (recessive.health * 0.25);
  }

  public getAttractiveness(): number {
    const dominant = this.getDominantChromosome();
    const recessive = this.getRecessiveChromosome();
    return (dominant.attractiveness * 0.75) + (recessive.attractiveness * 0.25);
  }

  public getGender(): 'male' | 'female' {
    return this.getDominantChromosome().gender;
  }

  public getVisionMultiplier(): number {
    const dominant = this.getDominantChromosome();
    const recessive = this.getRecessiveChromosome();
    return (dominant.vision * 0.75) + (recessive.vision * 0.25);
  }

  public mutate(mutationRate: number = 0.1): DNA {
    const newChromosome1 = this.mutateChromosome(this.chromosome1, mutationRate);
    const newChromosome2 = this.mutateChromosome(this.chromosome2, mutationRate);

    const newDominant = Math.random() < 0.1
      ? (this.dominantChromosome === 1 ? 2 : 1)
      : this.dominantChromosome;

    return new DNA(newChromosome1, newChromosome2, newDominant);
  }

  private mutateChromosome(chromosome: Chromosome, mutationRate: number): Chromosome {
    const mutated = { ...chromosome };

    if (Math.random() < mutationRate) {
      mutated.size = this.clamp(mutated.size + (Math.random() - 0.5) * 0.2, 0.6, 1.4);
    }

    if (Math.random() < mutationRate) {
      mutated.speed = this.clamp(mutated.speed + (Math.random() - 0.5) * 0.2, 0.5, 1.5);
    }

    if (Math.random() < mutationRate) {
      mutated.health = this.clamp(mutated.health + (Math.random() - 0.5) * 0.2, 0.5, 1.5);
    }

    if (Math.random() < mutationRate) {
      mutated.attractiveness = this.clamp(mutated.attractiveness + (Math.random() - 0.5) * 0.15, 0.3, 1.0);
    }

    if (Math.random() < mutationRate) {
      mutated.vision = this.clamp(mutated.vision + (Math.random() - 0.5) * 0.2, 0.5, 1.5);
    }

    if (Math.random() < mutationRate * 0.1) {
      mutated.gender = mutated.gender === 'male' ? 'female' : 'male';
    }

    return mutated;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  public crossover(other: DNA): DNA {
    const chromosome1 = Math.random() < 0.5
      ? this.chromosome1
      : other.chromosome1;

    const chromosome2 = Math.random() < 0.5
      ? this.chromosome2
      : other.chromosome2;

    const dominant: 1 | 2 = Math.random() < 0.5 ? 1 : 2;

    return new DNA(chromosome1, chromosome2, dominant);
  }

  public clone(): DNA {
    return new DNA(
      { ...this.chromosome1 },
      { ...this.chromosome2 },
      this.dominantChromosome
    );
  }

  public getColorFromGenes(): number {
    const dominant = this.getDominantChromosome();
    const recessive = this.getRecessiveChromosome();

    const healthNormalized = ((dominant.health * 0.75 + recessive.health * 0.25) - 0.5) / 1.0;
    const speedNormalized = ((dominant.speed * 0.75 + recessive.speed * 0.25) - 0.5) / 1.0;
    const sizeNormalized = ((dominant.size * 0.75 + recessive.size * 0.25) - 0.6) / 0.8;

    const baseR = this.getGender() === 'male' ? 100 : 120;
    const baseG = this.getGender() === 'male' ? 80 : 60;
    const baseB = this.getGender() === 'male' ? 60 : 90;

    const r = Math.floor(baseR + healthNormalized * 80);
    const g = Math.floor(baseG + speedNormalized * 60);
    const b = Math.floor(baseB + sizeNormalized * 50);

    return (Math.min(255, Math.max(0, r)) << 16) |
           (Math.min(255, Math.max(0, g)) << 8) |
           Math.min(255, Math.max(0, b));
  }
}
