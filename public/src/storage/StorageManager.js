/**
 * StorageManager - localStorage persistence for game data
 */
export class StorageManager {
  constructor(prefix = 'tetris_') {
    this.prefix = prefix;
    this.isAvailable = this.checkStorageAvailability();

    // Storage keys
    this.KEYS = {
      HIGH_SCORES: `${prefix}highscores`,
      SETTINGS: `${prefix}settings`,
      GAME_STATE: `${prefix}gamestate`,
      STATISTICS: `${prefix}statistics`,
    };
  }

  checkStorageAvailability() {
    try {
      const testKey = `${this.prefix}test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage not available:', e);
      return false;
    }
  }

  // High Scores Management
  saveHighScores(highScoreData) {
    if (!this.isAvailable) {
      console.warn('Storage not available, cannot save high scores');
      return false;
    }

    try {
      const data = {
        ...highScoreData,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      };

      localStorage.setItem(this.KEYS.HIGH_SCORES, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save high scores:', e);
      return false;
    }
  }

  loadHighScores() {
    if (!this.isAvailable) {
      return this.getDefaultHighScores();
    }

    try {
      const stored = localStorage.getItem(this.KEYS.HIGH_SCORES);
      if (!stored) {
        return this.getDefaultHighScores();
      }

      const data = JSON.parse(stored);
      return this.validateAndMigrateHighScores(data);
    } catch (e) {
      console.error('Failed to load high scores:', e);
      return this.getDefaultHighScores();
    }
  }

  getDefaultHighScores() {
    return {
      scores: [],
      personalBest: 0,
      lastUpdated: new Date().toISOString(),
      maxEntries: 10,
      version: '1.0',
    };
  }

  validateAndMigrateHighScores(data) {
    // Ensure data structure is valid
    const validated = {
      scores: Array.isArray(data.scores) ? data.scores : [],
      personalBest: typeof data.personalBest === 'number' ? data.personalBest : 0,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      maxEntries: data.maxEntries || 10,
      version: data.version || '1.0',
    };

    // Validate each score entry
    validated.scores = validated.scores.filter(score => {
      return (
        score &&
        typeof score.score === 'number' &&
        typeof score.level === 'number' &&
        typeof score.lines === 'number' &&
        score.date
      );
    });

    // Sort scores and limit to maxEntries
    validated.scores.sort((a, b) => b.score - a.score);
    validated.scores = validated.scores.slice(0, validated.maxEntries);

    // Update personal best
    validated.personalBest = validated.scores.length > 0 ? validated.scores[0].score : 0;

    return validated;
  }

  // Game Settings Management
  saveSettings(settings) {
    if (!this.isAvailable) {
      console.warn('Storage not available, cannot save settings');
      return false;
    }

    try {
      const data = {
        ...settings,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      };

      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  }

  loadSettings() {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.KEYS.SETTINGS);
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored);
      return this.validateAndMigrateSettings(data);
    } catch (e) {
      console.error('Failed to load settings:', e);
      return null;
    }
  }

  validateAndMigrateSettings(data) {
    // Basic validation - detailed validation is done by GameSettings class
    if (!data || typeof data !== 'object') {
      return null;
    }

    return {
      controls: data.controls || {},
      audio: data.audio || {},
      visual: data.visual || {},
      gameplay: data.gameplay || {},
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      version: data.version || '1.0',
    };
  }

  // Game State Management (for save/resume functionality)
  saveGameState(gameState) {
    if (!this.isAvailable) {
      console.warn('Storage not available, cannot save game state');
      return false;
    }

    try {
      const data = {
        hasActiveSave: true,
        gameState: gameState.toJSON(),
        savedAt: new Date().toISOString(),
        version: '1.0',
      };

      localStorage.setItem(this.KEYS.GAME_STATE, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save game state:', e);
      return false;
    }
  }

  loadGameState() {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.KEYS.GAME_STATE);
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored);
      if (!data.hasActiveSave) {
        return null;
      }

      return data;
    } catch (e) {
      console.error('Failed to load game state:', e);
      return null;
    }
  }

  clearGameState() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(this.KEYS.GAME_STATE);
      return true;
    } catch (e) {
      console.error('Failed to clear game state:', e);
      return false;
    }
  }

  // Statistics Management
  saveStatistics(stats) {
    if (!this.isAvailable) {
      console.warn('Storage not available, cannot save statistics');
      return false;
    }

    try {
      const data = {
        ...stats,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      };

      localStorage.setItem(this.KEYS.STATISTICS, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save statistics:', e);
      return false;
    }
  }

  loadStatistics() {
    if (!this.isAvailable) {
      return this.getDefaultStatistics();
    }

    try {
      const stored = localStorage.getItem(this.KEYS.STATISTICS);
      if (!stored) {
        return this.getDefaultStatistics();
      }

      const data = JSON.parse(stored);
      return this.validateStatistics(data);
    } catch (e) {
      console.error('Failed to load statistics:', e);
      return this.getDefaultStatistics();
    }
  }

  getDefaultStatistics() {
    return {
      totalGames: 0,
      totalPlayTime: 0,
      totalLinesCleared: 0,
      totalScore: 0,
      averageScore: 0,
      bestScore: 0,
      bestLevel: 0,
      tetrises: 0,
      perfectClears: 0,
      version: '1.0',
    };
  }

  validateStatistics(data) {
    const defaults = this.getDefaultStatistics();
    const validated = { ...defaults };

    // Copy valid numeric values
    for (const key of Object.keys(defaults)) {
      if (typeof data[key] === 'number' && !isNaN(data[key])) {
        validated[key] = data[key];
      }
    }

    validated.version = data.version || '1.0';
    return validated;
  }

  // Storage Management
  getStorageUsage() {
    if (!this.isAvailable) {
      return { used: 0, available: false };
    }

    try {
      let totalSize = 0;
      const sizes = {};

      for (const [name, key] of Object.entries(this.KEYS)) {
        const item = localStorage.getItem(key);
        const size = item ? new Blob([item]).size : 0;
        sizes[name.toLowerCase()] = size;
        totalSize += size;
      }

      return {
        used: totalSize,
        breakdown: sizes,
        available: true,
      };
    } catch (e) {
      console.error('Failed to calculate storage usage:', e);
      return { used: 0, available: false };
    }
  }

  clearAllData() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      for (const key of Object.values(this.KEYS)) {
        localStorage.removeItem(key);
      }
      return true;
    } catch (e) {
      console.error('Failed to clear all data:', e);
      return false;
    }
  }

  exportData() {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const exportData = {
        highScores: this.loadHighScores(),
        settings: this.loadSettings(),
        statistics: this.loadStatistics(),
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      return exportData;
    } catch (e) {
      console.error('Failed to export data:', e);
      return null;
    }
  }

  importData(importData) {
    if (!this.isAvailable) {
      console.warn('Storage not available, cannot import data');
      return false;
    }

    try {
      if (importData.highScores) {
        this.saveHighScores(importData.highScores);
      }

      if (importData.settings) {
        this.saveSettings(importData.settings);
      }

      if (importData.statistics) {
        this.saveStatistics(importData.statistics);
      }

      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }

  // Utility methods
  isStorageAvailable() {
    return this.isAvailable;
  }

  getStorageInfo() {
    return {
      available: this.isAvailable,
      prefix: this.prefix,
      keys: this.KEYS,
      usage: this.getStorageUsage(),
    };
  }

  // Data migration support
  migrateFromVersion(fromVersion, toVersion = '1.0') {
    console.log(`Migrating data from version ${fromVersion} to ${toVersion}`);

    // Future migration logic would go here
    // For now, just log that migration was requested

    return true;
  }
}
