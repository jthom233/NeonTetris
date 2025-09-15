/**
 * Score - Tracks player performance and progression
 */
export class Score {
  constructor() {
    this.currentScore = 0;
    this.level = 1;
    this.lines = 0;
    this.totalLines = 0;
    this.multiplier = 1;
    this.lastLineClears = [];
  }

  static SCORING = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2,
  };

  static LINES_PER_LEVEL = 10;

  addLineClears(lineCount) {
    if (lineCount <= 0 || lineCount > 4) {
      throw new Error(`Invalid line count: ${lineCount}`);
    }

    this.lines += lineCount;
    this.totalLines += lineCount;
    this.lastLineClears.push(lineCount);

    // Keep only recent line clears for combo detection
    if (this.lastLineClears.length > 5) {
      this.lastLineClears.shift();
    }

    // Calculate score based on line count and level
    let baseScore;
    switch (lineCount) {
    case 1:
      baseScore = Score.SCORING.SINGLE;
      break;
    case 2:
      baseScore = Score.SCORING.DOUBLE;
      break;
    case 3:
      baseScore = Score.SCORING.TRIPLE;
      break;
    case 4:
      baseScore = Score.SCORING.TETRIS;
      break;
    default:
      baseScore = 0;
    }

    // Apply level multiplier
    const scoreToAdd = baseScore * this.level;
    this.currentScore += scoreToAdd;

    // Check for level up
    const newLevel = Math.floor(this.totalLines / Score.LINES_PER_LEVEL) + 1;
    const leveledUp = newLevel > this.level;
    this.level = newLevel;

    return {
      scoreAdded: scoreToAdd,
      leveledUp,
      isTetris: lineCount === 4,
    };
  }

  addSoftDrop(cells = 1) {
    const scoreToAdd = Score.SCORING.SOFT_DROP * cells;
    this.currentScore += scoreToAdd;
    return scoreToAdd;
  }

  addHardDrop(cells = 1) {
    const scoreToAdd = Score.SCORING.HARD_DROP * cells;
    this.currentScore += scoreToAdd;
    return scoreToAdd;
  }

  getComboMultiplier() {
    // Simple combo detection - consecutive Tetrises get bonus
    if (this.lastLineClears.length >= 2) {
      const recentClears = this.lastLineClears.slice(-2);
      if (recentClears.every(clear => clear === 4)) {
        return 1.5; // 50% bonus for consecutive Tetrises
      }
    }
    return 1;
  }

  getFallSpeed() {
    // Calculate piece fall speed based on level
    // Higher levels = faster falling pieces
    const baseSpeed = 1000; // 1 second at level 1
    const speedIncrease = Math.pow(0.8, this.level - 1);
    return Math.max(50, baseSpeed * speedIncrease); // Minimum 50ms
  }

  getLinesUntilNextLevel() {
    const linesForCurrentLevel = this.level * Score.LINES_PER_LEVEL;
    return linesForCurrentLevel - this.totalLines;
  }

  getScoreForLines(lineCount, level = this.level) {
    let baseScore;
    switch (lineCount) {
    case 1:
      baseScore = Score.SCORING.SINGLE;
      break;
    case 2:
      baseScore = Score.SCORING.DOUBLE;
      break;
    case 3:
      baseScore = Score.SCORING.TRIPLE;
      break;
    case 4:
      baseScore = Score.SCORING.TETRIS;
      break;
    default:
      return 0;
    }
    return baseScore * level;
  }

  reset() {
    this.currentScore = 0;
    this.level = 1;
    this.lines = 0;
    this.totalLines = 0;
    this.multiplier = 1;
    this.lastLineClears = [];
  }

  clone() {
    const cloned = new Score();
    cloned.currentScore = this.currentScore;
    cloned.level = this.level;
    cloned.lines = this.lines;
    cloned.totalLines = this.totalLines;
    cloned.multiplier = this.multiplier;
    cloned.lastLineClears = [...this.lastLineClears];
    return cloned;
  }

  toJSON() {
    return {
      currentScore: this.currentScore,
      level: this.level,
      lines: this.lines,
      totalLines: this.totalLines,
      multiplier: this.multiplier,
      lastLineClears: [...this.lastLineClears],
    };
  }

  static fromJSON(data) {
    const score = new Score();
    score.currentScore = data.currentScore || 0;
    score.level = data.level || 1;
    score.lines = data.lines || 0;
    score.totalLines = data.totalLines || 0;
    score.multiplier = data.multiplier || 1;
    score.lastLineClears = data.lastLineClears || [];
    return score;
  }

  equals(other) {
    return other &&
           this.currentScore === other.currentScore &&
           this.level === other.level &&
           this.lines === other.lines &&
           this.totalLines === other.totalLines;
  }
}