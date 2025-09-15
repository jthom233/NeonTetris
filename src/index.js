/**
 * Neon Tetris Game - Main Entry Point
 * Modern JavaScript ES2022 implementation with Canvas rendering
 */

import { GameEngine } from './services/GameEngine.js';
import { Renderer } from './rendering/Renderer.js';
import { InputHandler } from './input/InputHandler.js';
import { StorageManager } from './storage/StorageManager.js';
import { GameSettings } from './models/GameSettings.js';
import { HighScore } from './models/HighScore.js';

class TetrisGame {
  constructor() {
    this.canvas = null;
    this.gameEngine = null;
    this.renderer = null;
    this.inputHandler = null;
    this.storageManager = null;
    this.gameSettings = null;
    this.highScore = null;

    this.isInitialized = false;
    this.currentState = 'menu'; // menu, playing, paused, gameOver

    console.log('🎮 Neon Tetris Game Initializing...');
  }

  async init() {
    try {
      // Initialize storage first
      this.storageManager = new StorageManager();

      // Load or create game settings
      const savedSettings = this.storageManager.loadSettings();
      this.gameSettings = new GameSettings(savedSettings);

      // Load high scores
      const savedHighScores = this.storageManager.loadHighScores();
      this.highScore = HighScore.fromJSON(savedHighScores);

      // Get canvas element
      this.canvas = document.getElementById('game-canvas');
      if (!this.canvas) {
        throw new Error('Canvas element with id "game-canvas" not found');
      }

      // Initialize renderer
      this.renderer = new Renderer();
      const theme = this.gameSettings.getCurrentTheme();
      this.renderer.initialize(this.canvas, theme);

      // Initialize game engine
      this.gameEngine = new GameEngine({
        boardWidth: 10,
        boardHeight: 20,
        settings: this.gameSettings,
      });

      this.gameEngine.initialize();

      // Initialize input handler
      this.inputHandler = new InputHandler(this.gameSettings);
      this.inputHandler.enable();

      // Set up event listeners
      this.setupEventListeners();

      // Draw initial state
      this.showMenu();

      this.isInitialized = true;
      console.log('✅ Game initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
      this.showError(error.message);
    }
  }

  setupEventListeners() {
    // Game engine events
    this.gameEngine.addEventListener('gameStarted', (event) => {
      this.currentState = 'playing';
      this.hideMenu();
    });

    this.gameEngine.addEventListener('gamePaused', () => {
      this.currentState = 'paused';
      this.showPauseOverlay();
    });

    this.gameEngine.addEventListener('gameResumed', () => {
      this.currentState = 'playing';
      this.hidePauseOverlay();
    });

    this.gameEngine.addEventListener('gameOver', (event) => {
      this.currentState = 'gameOver';
      this.handleGameOver(event.detail);
    });

    this.gameEngine.addEventListener('scoreChanged', (event) => {
      this.updateScoreDisplay(event.detail);
    });

    this.gameEngine.addEventListener('levelUp', (event) => {
      this.showLevelUpEffect(event.detail);
    });

    this.gameEngine.addEventListener('lineCleared', (event) => {
      this.renderer.animateLineClear(event.detail.lines);
    });

    // Input handler events
    this.inputHandler.addEventListener('input', (event) => {
      this.gameEngine.handleInput(event.detail);
    });

    // UI button events
    this.setupUIEventListeners();

    // Game loop
    this.startRenderLoop();

    console.log('🎹 Event listeners registered');
  }

  setupUIEventListeners() {
    // Start button
    const startButton = document.getElementById('start-button');
    if (startButton) {
      startButton.addEventListener('click', () => this.startNewGame());
    }

    // Settings button
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', () => this.showSettings());
    }

    // High scores button
    const scoresButton = document.getElementById('scores-button');
    if (scoresButton) {
      scoresButton.addEventListener('click', () => this.showHighScores());
    }

    // Resume button (for pause overlay)
    const resumeButton = document.getElementById('resume-button');
    if (resumeButton) {
      resumeButton.addEventListener('click', () => this.resumeGame());
    }

    // Restart button (for game over)
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
      restartButton.addEventListener('click', () => this.startNewGame());
    }
  }

  startRenderLoop() {
    const render = () => {
      if (this.isInitialized && this.renderer) {
        const gameState = this.gameEngine.getState();
        if (gameState && this.currentState === 'playing') {
          this.renderer.render(gameState);
        }
      }

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  startNewGame() {
    if (!this.isInitialized) {
      console.warn('Game not initialized');
      return;
    }

    console.log('🎮 Starting new game...');

    try {
      this.gameEngine.reset();
      this.gameEngine.start();
      this.currentState = 'playing';
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showError(`Failed to start game: ${error.message}`);
    }
  }

  pauseGame() {
    if (this.currentState === 'playing') {
      this.gameEngine.pause();
    }
  }

  resumeGame() {
    if (this.currentState === 'paused') {
      this.gameEngine.resume();
    }
  }

  handleGameOver(gameOverData) {
    console.log('🎯 Game Over:', gameOverData);

    // Check if it's a high score
    const isHighScore = this.highScore.isHighScore(gameOverData.finalScore);

    if (isHighScore) {
      const scoreEntry = {
        score: gameOverData.finalScore,
        level: gameOverData.level,
        lines: gameOverData.lines,
        duration: gameOverData.duration,
        date: new Date(),
      };

      const isNewRecord = this.highScore.addScore(scoreEntry);
      this.storageManager.saveHighScores(this.highScore.toJSON());

      this.showHighScoreDialog(scoreEntry, isNewRecord);
    } else {
      this.showGameOverDialog(gameOverData);
    }
  }

  updateScoreDisplay(scoreData) {
    // Update UI elements if they exist
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
      scoreElement.textContent = scoreData.score.toLocaleString();
    }

    const levelElement = document.getElementById('level-display');
    if (levelElement) {
      levelElement.textContent = scoreData.level;
    }

    const linesElement = document.getElementById('lines-display');
    if (linesElement) {
      linesElement.textContent = scoreData.lines;
    }
  }

  showLevelUpEffect(levelData) {
    console.log('📈 Level Up!', levelData);

    // Add visual effect for level up
    const levelUpElement = document.getElementById('level-up-effect');
    if (levelUpElement) {
      levelUpElement.textContent = `LEVEL ${levelData.newLevel}!`;
      levelUpElement.classList.add('show');

      setTimeout(() => {
        levelUpElement.classList.remove('show');
      }, 2000);
    }
  }

  showMenu() {
    this.currentState = 'menu';

    // Clear canvas and show menu background
    if (this.renderer) {
      this.renderer.clear();
      this.drawMenuBackground();
    }

    const overlay = document.getElementById('game-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }

    // Update high score display in menu
    this.updateMenuHighScore();
  }

  hideMenu() {
    const overlay = document.getElementById('game-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  showPauseOverlay() {
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
      pauseOverlay.classList.remove('hidden');
    }
  }

  hidePauseOverlay() {
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
      pauseOverlay.classList.add('hidden');
    }
  }

  showGameOverDialog(gameOverData) {
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) {
      // Update final score display
      const finalScoreElement = document.getElementById('final-score');
      if (finalScoreElement) {
        finalScoreElement.textContent = gameOverData.finalScore.toLocaleString();
      }

      const finalLevelElement = document.getElementById('final-level');
      if (finalLevelElement) {
        finalLevelElement.textContent = gameOverData.level;
      }

      const finalLinesElement = document.getElementById('final-lines');
      if (finalLinesElement) {
        finalLinesElement.textContent = gameOverData.lines;
      }

      gameOverOverlay.classList.remove('hidden');
    }
  }

  showHighScoreDialog(scoreEntry, isNewRecord) {
    console.log('🏆 New High Score!', scoreEntry);

    const highScoreOverlay = document.getElementById('high-score-overlay');
    if (highScoreOverlay) {
      const messageElement = document.getElementById('high-score-message');
      if (messageElement) {
        messageElement.textContent = isNewRecord ? 'NEW RECORD!' : 'HIGH SCORE!';
      }

      const scoreElement = document.getElementById('high-score-value');
      if (scoreElement) {
        scoreElement.textContent = scoreEntry.score.toLocaleString();
      }

      highScoreOverlay.classList.remove('hidden');
    }
  }

  updateMenuHighScore() {
    const menuHighScoreElement = document.getElementById('menu-high-score');
    if (menuHighScoreElement && this.highScore) {
      const personalBest = this.highScore.getPersonalBest();
      menuHighScoreElement.textContent = personalBest ? personalBest.toLocaleString() : '0';
    }
  }

  drawMenuBackground() {
    if (!this.renderer) return;

    // Draw animated background for menu
    this.renderer.clear();

    // Add some visual flair for the menu
    const ctx = this.renderer.ctx;
    const theme = this.gameSettings.getCurrentTheme();

    // Draw pulsing background
    const time = Date.now() * 0.001;
    const alpha = (Math.sin(time) + 1) * 0.1 + 0.1;

    ctx.fillStyle = this.renderer.addAlpha(theme.primary, alpha);
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  showSettings() {
    console.log('⚙️ Opening settings...');
    // TODO: Implement settings dialog
  }

  showHighScores() {
    console.log('🏆 Opening high scores...');
    // TODO: Implement high scores dialog
  }

  showError(message) {
    console.error('Error:', message);

    // Show error in UI if possible
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }

  // Save game settings when they change
  saveSettings() {
    if (this.storageManager && this.gameSettings) {
      this.storageManager.saveSettings(this.gameSettings.toJSON());
    }
  }

  // Cleanup when page unloads
  destroy() {
    if (this.inputHandler) {
      this.inputHandler.disable();
    }

    if (this.gameEngine) {
      this.gameEngine.reset();
    }

    this.saveSettings();
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const game = new TetrisGame();
  await game.init();

  // Save state on page unload
  window.addEventListener('beforeunload', () => {
    game.destroy();
  });

  // Make game instance available globally for debugging
  window.tetrisGame = game;
});

export default TetrisGame;