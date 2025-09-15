/**
 * StorageManager Contract Test
 * Tests the StorageManager interface contract for localStorage persistence
 * 
 * CRITICAL: This test MUST fail initially (RED phase of TDD)
 * Implementation should only be created after this test fails
 */

import { StorageManager } from '../../src/storage/StorageManager.js';

describe('StorageManager Contract', () => {
  let storageManager;
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    
    // Replace global localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    storageManager = new StorageManager();
  });

  afterEach(() => {
    if (storageManager && storageManager.destroy) {
      storageManager.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Initialization Contract', () => {
    it('should create StorageManager instance', () => {
      expect(storageManager).toBeInstanceOf(StorageManager);
      expect(storageManager).toBeDefined();
    });

    it('should initialize with storage configuration', () => {
      const config = {
        prefix: 'tetris_',
        version: '1.0.0',
        enableCompression: false,
      };

      expect(() => storageManager.initialize(config)).not.toThrow();
      expect(storageManager.isInitialized()).toBe(true);
    });

    it('should use default configuration if none provided', () => {
      expect(() => storageManager.initialize()).not.toThrow();
      expect(storageManager.isInitialized()).toBe(true);
    });

    it('should throw error for invalid configuration', () => {
      const invalidConfig = { version: null };
      expect(() => storageManager.initialize(invalidConfig)).toThrow('Invalid configuration');
    });
  });

  describe('High Score Persistence Contract', () => {
    let mockHighScores;

    beforeEach(() => {
      storageManager.initialize();
      
      mockHighScores = {
        scores: [
          { score: 10000, level: 10, lines: 100, date: new Date().toISOString(), duration: 600 },
          { score: 8500, level: 8, lines: 85, date: new Date().toISOString(), duration: 480 },
          { score: 7200, level: 7, lines: 72, date: new Date().toISOString(), duration: 420 },
        ],
        personalBest: 10000,
        lastUpdated: new Date().toISOString(),
      };
    });

    it('should save high scores to localStorage', () => {
      expect(() => storageManager.saveHighScores(mockHighScores)).not.toThrow();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetris_highscores',
        JSON.stringify(mockHighScores)
      );
    });

    it('should load high scores from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHighScores));
      
      const loadedScores = storageManager.loadHighScores();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tetris_highscores');
      expect(loadedScores).toEqual(mockHighScores);
    });

    it('should return default high scores when none exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const defaultScores = storageManager.loadHighScores();
      
      expect(defaultScores).toHaveProperty('scores');
      expect(defaultScores.scores).toHaveLength(0);
      expect(defaultScores.personalBest).toBe(0);
    });

    it('should validate high score data structure', () => {
      const invalidScores = { invalid: 'data' };
      
      expect(() => storageManager.saveHighScores(invalidScores)).toThrow('Invalid high scores data');
    });

    it('should add new high score correctly', () => {
      const newScore = {
        score: 12000,
        level: 12,
        lines: 120,
        date: new Date().toISOString(),
        duration: 720,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockHighScores));
      
      const updatedScores = storageManager.addHighScore(newScore);
      
      expect(updatedScores.scores[0]).toEqual(newScore);
      expect(updatedScores.personalBest).toBe(12000);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should maintain maximum number of high scores', () => {
      // Fill with 10 scores
      const fullScores = {
        scores: Array(10).fill().map((_, i) => ({
          score: 1000 * (10 - i),
          level: 10 - i,
          lines: 100 - i * 10,
          date: new Date().toISOString(),
          duration: 300,
        })),
        personalBest: 10000,
        lastUpdated: new Date().toISOString(),
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(fullScores));
      
      const lowScore = {
        score: 500, // Lower than all existing scores
        level: 1,
        lines: 5,
        date: new Date().toISOString(),
        duration: 120,
      };

      const updatedScores = storageManager.addHighScore(lowScore);
      
      // Should still have only 10 scores
      expect(updatedScores.scores).toHaveLength(10);
      // Low score should not be included
      expect(updatedScores.scores.find(s => s.score === 500)).toBeUndefined();
    });
  });

  describe('Game Settings Persistence Contract', () => {
    let mockSettings;

    beforeEach(() => {
      storageManager.initialize();
      
      mockSettings = {
        controls: {
          moveLeft: 'ArrowLeft',
          moveRight: 'ArrowRight',
          rotate: 'ArrowUp',
          softDrop: 'ArrowDown',
          hardDrop: 'Space',
          pause: 'KeyP',
        },
        audio: {
          masterVolume: 0.8,
          musicVolume: 0.6,
          sfxVolume: 0.9,
          musicEnabled: true,
          sfxEnabled: true,
        },
        visual: {
          neonIntensity: 0.8,
          animationSpeed: 1.0,
          colorTheme: 'classic',
          showGhost: true,
          showGrid: true,
          particleEffects: true,
        },
        gameplay: {
          autoRepeat: 150,
          softDropSpeed: 2.0,
          lockDelay: 500,
        },
      };
    });

    it('should save game settings to localStorage', () => {
      expect(() => storageManager.saveSettings(mockSettings)).not.toThrow();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetris_settings',
        JSON.stringify(mockSettings)
      );
    });

    it('should load game settings from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const loadedSettings = storageManager.loadSettings();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tetris_settings');
      expect(loadedSettings).toEqual(mockSettings);
    });

    it('should return default settings when none exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const defaultSettings = storageManager.loadSettings();
      
      expect(defaultSettings).toHaveProperty('controls');
      expect(defaultSettings).toHaveProperty('audio');
      expect(defaultSettings).toHaveProperty('visual');
      expect(defaultSettings).toHaveProperty('gameplay');
    });

    it('should validate settings data structure', () => {
      const invalidSettings = { controls: null };
      
      expect(() => storageManager.saveSettings(invalidSettings)).toThrow('Invalid settings data');
    });

    it('should merge partial settings updates', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSettings));
      
      const partialUpdate = {
        audio: {
          masterVolume: 0.5,
          musicEnabled: false,
        },
      };

      const mergedSettings = storageManager.updateSettings(partialUpdate);
      
      expect(mergedSettings.audio.masterVolume).toBe(0.5);
      expect(mergedSettings.audio.musicEnabled).toBe(false);
      // Other settings should remain unchanged
      expect(mergedSettings.visual.neonIntensity).toBe(0.8);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Game State Persistence Contract', () => {
    let mockGameState;

    beforeEach(() => {
      storageManager.initialize();
      
      mockGameState = {
        board: {
          width: 10,
          height: 20,
          grid: Array(20).fill().map(() => Array(10).fill(null)),
          activePiece: TestUtils.createMockTetromino('I'),
          nextPiece: TestUtils.createMockTetromino('T'),
        },
        score: {
          currentScore: 5000,
          level: 5,
          lines: 50,
          totalLines: 150,
        },
        level: 5,
        linesCleared: 50,
        gameStatus: 'playing',
        startTime: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
      };
    });

    it('should save game state for resume functionality', () => {
      expect(() => storageManager.saveGameState(mockGameState)).not.toThrow();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetris_gamestate',
        expect.stringContaining('hasActiveSave')
      );
    });

    it('should load saved game state', () => {
      const savedData = {
        hasActiveSave: true,
        ...mockGameState,
        timestamp: new Date().toISOString(),
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData));
      
      const loadedState = storageManager.loadGameState();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tetris_gamestate');
      expect(loadedState.hasActiveSave).toBe(true);
      expect(loadedState.board).toEqual(mockGameState.board);
    });

    it('should return null when no saved game exists', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ hasActiveSave: false }));
      
      const loadedState = storageManager.loadGameState();
      
      expect(loadedState).toBeNull();
    });

    it('should clear saved game state', () => {
      expect(() => storageManager.clearGameState()).not.toThrow();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetris_gamestate',
        JSON.stringify({ hasActiveSave: false })
      );
    });

    it('should validate game state data structure', () => {
      const invalidState = { board: null };
      
      expect(() => storageManager.saveGameState(invalidState)).toThrow('Invalid game state');
    });

    it('should check if saved game exists', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ hasActiveSave: true }));
      
      const hasSaved = storageManager.hasSavedGame();
      
      expect(hasSaved).toBe(true);
    });
  });

  describe('Data Migration Contract', () => {
    beforeEach(() => {
      storageManager.initialize({ version: '2.0.0' });
    });

    it('should migrate data from older versions', () => {
      const oldVersionData = {
        version: '1.0.0',
        scores: [{ score: 1000 }], // Old format
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldVersionData));
      
      const migratedData = storageManager.loadHighScores();
      
      // Should convert to new format
      expect(migratedData).toHaveProperty('scores');
      expect(migratedData).toHaveProperty('personalBest');
      expect(migratedData).toHaveProperty('lastUpdated');
    });

    it('should handle corrupted data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json data');
      
      expect(() => storageManager.loadHighScores()).not.toThrow();
      
      // Should return default data
      const defaultData = storageManager.loadHighScores();
      expect(defaultData.scores).toEqual([]);
    });

    it('should backup data before migration', () => {
      const oldData = { version: '1.0.0', scores: [] };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData));
      
      storageManager.loadHighScores();
      
      // Should create backup
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetris_highscores_backup_1.0.0',
        JSON.stringify(oldData)
      );
    });
  });

  describe('Performance Contract', () => {
    beforeEach(() => {
      storageManager.initialize();
    });

    it('should complete save operations quickly', () => {
      const largeData = {
        scores: Array(1000).fill().map((_, i) => ({
          score: i * 100,
          level: i % 10,
          lines: i * 10,
          date: new Date().toISOString(),
          duration: 300,
        })),
      };

      const startTime = performance.now();
      storageManager.saveHighScores(largeData);
      const endTime = performance.now();

      const saveTime = endTime - startTime;
      expect(saveTime).toBeLessThan(50); // Less than 50ms
    });

    it('should handle storage quota exceeded gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => storageManager.saveHighScores({ scores: [] })).toThrow('Storage quota exceeded');
    });

    it('should compress large data when enabled', () => {
      storageManager.initialize({ enableCompression: true });
      
      const largeData = { scores: Array(100).fill({ score: 1000 }) };
      
      storageManager.saveHighScores(largeData);
      
      // Verify compression was applied (mock would need compression logic)
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Error Handling Contract', () => {
    beforeEach(() => {
      storageManager.initialize();
    });

    it('should handle localStorage unavailable', () => {
      // Simulate localStorage not available
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
      });

      const fallbackStorage = new StorageManager();
      
      expect(() => fallbackStorage.initialize()).not.toThrow();
      
      // Should use in-memory storage as fallback
      expect(() => fallbackStorage.saveHighScores({ scores: [] })).not.toThrow();
    });

    it('should provide meaningful error messages', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(() => storageManager.saveHighScores({ scores: [] })).toThrow(/security/i);
    });

    it('should retry failed operations', () => {
      let attempts = 0;
      mockLocalStorage.setItem.mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary error');
        }
      });

      expect(() => storageManager.saveHighScores({ scores: [] })).not.toThrow();
      expect(attempts).toBe(3);
    });
  });

  describe('Cleanup Contract', () => {
    it('should clear all storage data', () => {
      storageManager.initialize();
      
      expect(() => storageManager.clearAllData()).not.toThrow();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tetris_highscores');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tetris_settings');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tetris_gamestate');
    });

    it('should export all data for backup', () => {
      storageManager.initialize();
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'tetris_highscores') return JSON.stringify({ scores: [] });
        if (key === 'tetris_settings') return JSON.stringify({ audio: {} });
        return null;
      });

      const exportedData = storageManager.exportAllData();
      
      expect(exportedData).toHaveProperty('highScores');
      expect(exportedData).toHaveProperty('settings');
      expect(exportedData).toHaveProperty('exportDate');
    });

    it('should import data from backup', () => {
      storageManager.initialize();
      
      const importData = {
        highScores: { scores: [{ score: 1000 }] },
        settings: { audio: { masterVolume: 0.5 } },
        exportDate: new Date().toISOString(),
      };

      expect(() => storageManager.importAllData(importData)).not.toThrow();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tetris_highscores',
        JSON.stringify(importData.highScores)
      );
    });
  });
});