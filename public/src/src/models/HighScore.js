/**
 * HighScore - Persistent record of best performances
 */
export class HighScore {
  constructor(maxEntries = 10) {
    this.scores = [];
    this.maxEntries = maxEntries;
    this.personalBest = 0;
    this.lastUpdated = new Date();
  }

  addScore(scoreEntry) {
    this.validateScoreEntry(scoreEntry);

    // Create a complete score entry
    const entry = {
      score: scoreEntry.score,
      level: scoreEntry.level,
      lines: scoreEntry.lines,
      date: scoreEntry.date || new Date(),
      duration: scoreEntry.duration || 0,
      ...scoreEntry, // Allow additional properties
    };

    // Add to scores array
    this.scores.push(entry);

    // Sort by score (descending)
    this.scores.sort((a, b) => b.score - a.score);

    // Trim to max entries
    if (this.scores.length > this.maxEntries) {
      this.scores = this.scores.slice(0, this.maxEntries);
    }

    // Update personal best
    this.personalBest = this.scores.length > 0 ? this.scores[0].score : 0;
    this.lastUpdated = new Date();

    // Return whether this was a new high score
    return this.scores[0] === entry;
  }

  validateScoreEntry(entry) {
    if (!entry || typeof entry !== 'object') {
      throw new Error('Score entry must be an object');
    }

    if (typeof entry.score !== 'number' || entry.score < 0) {
      throw new Error('Score must be a non-negative number');
    }

    if (typeof entry.level !== 'number' || entry.level < 1) {
      throw new Error('Level must be a positive number');
    }

    if (typeof entry.lines !== 'number' || entry.lines < 0) {
      throw new Error('Lines must be a non-negative number');
    }

    if (
      entry.duration !== undefined &&
      (typeof entry.duration !== 'number' || entry.duration < 0)
    ) {
      throw new Error('Duration must be a non-negative number');
    }
  }

  getTopScores(count = this.maxEntries) {
    return this.scores.slice(0, Math.min(count, this.scores.length));
  }

  getPersonalBest() {
    return this.personalBest;
  }

  isHighScore(score) {
    if (this.scores.length < this.maxEntries) {
      return true; // Always a high score if not at max capacity
    }

    return score > this.scores[this.scores.length - 1].score;
  }

  getRank(score) {
    let rank = 1;
    for (const entry of this.scores) {
      if (score < entry.score) {
        rank++;
      } else {
        break;
      }
    }

    return rank;
  }

  getStatistics() {
    if (this.scores.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        averageLevel: 0,
        averageLines: 0,
        averageDuration: 0,
        bestScore: 0,
        bestLevel: 0,
        bestLines: 0,
        totalPlayTime: 0,
      };
    }

    const totalGames = this.scores.length;
    const totalScore = this.scores.reduce((sum, entry) => sum + entry.score, 0);
    const totalLevel = this.scores.reduce((sum, entry) => sum + entry.level, 0);
    const totalLines = this.scores.reduce((sum, entry) => sum + entry.lines, 0);
    const totalDuration = this.scores.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    return {
      totalGames,
      averageScore: Math.round(totalScore / totalGames),
      averageLevel: Math.round((totalLevel / totalGames) * 10) / 10,
      averageLines: Math.round(totalLines / totalGames),
      averageDuration: Math.round(totalDuration / totalGames),
      bestScore: this.scores[0].score,
      bestLevel: Math.max(...this.scores.map(s => s.level)),
      bestLines: Math.max(...this.scores.map(s => s.lines)),
      totalPlayTime: totalDuration,
    };
  }

  clear() {
    this.scores = [];
    this.personalBest = 0;
    this.lastUpdated = new Date();
  }

  removeScore(index) {
    if (index >= 0 && index < this.scores.length) {
      this.scores.splice(index, 1);
      this.personalBest = this.scores.length > 0 ? this.scores[0].score : 0;
      this.lastUpdated = new Date();
      return true;
    }
    return false;
  }

  getScoreHistory() {
    return [...this.scores].reverse(); // Return chronological order
  }

  getRecentScores(count = 5) {
    return this.scores.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, count);
  }

  export() {
    return {
      scores: this.scores.map(score => ({
        score: score.score,
        level: score.level,
        lines: score.lines,
        date: score.date.toISOString(),
        duration: score.duration,
      })),
      personalBest: this.personalBest,
      lastUpdated: this.lastUpdated.toISOString(),
      maxEntries: this.maxEntries,
    };
  }

  import(data) {
    this.validateImportData(data);

    this.scores = data.scores.map(score => ({
      ...score,
      date: new Date(score.date),
    }));

    this.personalBest = data.personalBest || 0;
    this.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : new Date();
    this.maxEntries = data.maxEntries || 10;

    // Re-sort and validate
    this.scores.sort((a, b) => b.score - a.score);
    this.scores = this.scores.slice(0, this.maxEntries);

    if (this.scores.length > 0) {
      this.personalBest = this.scores[0].score;
    }
  }

  validateImportData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Import data must be an object');
    }

    if (!Array.isArray(data.scores)) {
      throw new Error('Scores must be an array');
    }

    for (const score of data.scores) {
      this.validateScoreEntry({
        ...score,
        date: new Date(score.date),
      });
    }
  }

  clone() {
    const cloned = new HighScore(this.maxEntries);
    cloned.scores = this.scores.map(score => ({ ...score, date: new Date(score.date) }));
    cloned.personalBest = this.personalBest;
    cloned.lastUpdated = new Date(this.lastUpdated);
    return cloned;
  }

  toJSON() {
    return this.export();
  }

  static fromJSON(data) {
    const highScore = new HighScore(data.maxEntries);
    highScore.import(data);
    return highScore;
  }

  equals(other) {
    if (!other) return false;

    return (
      this.personalBest === other.personalBest &&
      this.scores.length === other.scores.length &&
      this.scores.every(
        (score, index) =>
          score.score === other.scores[index]?.score &&
          score.level === other.scores[index]?.level &&
          score.lines === other.scores[index]?.lines
      )
    );
  }
}
