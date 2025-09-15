/**
 * Neon Tetris Game - Main Entry Point
 * Modern JavaScript ES2022 implementation with Canvas rendering
 */

// Game initialization and basic structure
class TetrisGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    
    console.log('🎮 Neon Tetris Game Initializing...');
  }

  async init() {
    try {
      // Get canvas elements
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      
      if (!this.canvas || !this.ctx) {
        throw new Error('Canvas not found or WebGL not supported');
      }

      // Set up canvas properties
      this.setupCanvas();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Draw initial state
      this.drawWelcomeScreen();
      
      console.log('✅ Game initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
    }
  }

  setupCanvas() {
    // Enable crisp pixel art rendering
    this.ctx.imageSmoothingEnabled = false;
    
    // Set up neon glow effect
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 0;
    
    console.log(`📐 Canvas setup: ${this.canvas.width}x${this.canvas.height}`);
  }

  setupEventListeners() {
    // Start button
    const startButton = document.getElementById('start-button');
    if (startButton) {
      startButton.addEventListener('click', () => this.startGame());
    }

    // Settings button
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', () => this.showSettings());
    }

    // Keyboard controls
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.addEventListener('keyup', (event) => this.handleKeyUp(event));

    console.log('🎹 Event listeners registered');
  }

  drawWelcomeScreen() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw neon grid background
    this.drawNeonGrid();

    // Draw welcome text
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = 'bold 24px Orbitron, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#00ffff';
    
    this.ctx.fillText(
      'NEON TETRIS',
      this.canvas.width / 2,
      this.canvas.height / 2 - 50,
    );

    this.ctx.font = '16px Orbitron, monospace';
    this.ctx.fillText(
      'Press START to begin',
      this.canvas.width / 2,
      this.canvas.height / 2 + 20,
    );

    this.ctx.shadowBlur = 0;
  }

  drawNeonGrid() {
    const cellSize = 32;
    const cols = Math.floor(this.canvas.width / cellSize);
    const rows = Math.floor(this.canvas.height / cellSize);

    this.ctx.strokeStyle = '#00ffff';
    this.ctx.globalAlpha = 0.1;
    this.ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellSize, 0);
      this.ctx.lineTo(x * cellSize, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellSize);
      this.ctx.lineTo(this.canvas.width, y * cellSize);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1.0;
  }

  startGame() {
    console.log('🎮 Starting new game...');
    
    // Hide menu overlay
    const overlay = document.getElementById('game-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }

    this.isRunning = true;
    
    // TODO: Initialize game state and start game loop
    this.gameLoop();
  }

  showSettings() {
    console.log('⚙️ Opening settings...');
    // TODO: Implement settings menu
  }

  handleKeyDown(event) {
    if (!this.isRunning) return;

    switch (event.code) {
    case 'ArrowLeft':
      console.log('⬅️ Move left');
      event.preventDefault();
      break;
    case 'ArrowRight':
      console.log('➡️ Move right');
      event.preventDefault();
      break;
    case 'ArrowUp':
      console.log('🔄 Rotate');
      event.preventDefault();
      break;
    case 'ArrowDown':
      console.log('⬇️ Soft drop');
      event.preventDefault();
      break;
    case 'Space':
      console.log('⬇️⬇️ Hard drop');
      event.preventDefault();
      break;
    case 'KeyP':
      console.log('⏸️ Pause');
      event.preventDefault();
      break;
    }
  }

  handleKeyUp() {
    // Handle key release events if needed
  }

  gameLoop() {
    if (!this.isRunning) return;

    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw neon grid
    this.drawNeonGrid();

    // TODO: Update game state
    // TODO: Render game objects

    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const game = new TetrisGame();
  await game.init();
  
  // Make game instance available globally for debugging
  window.tetrisGame = game;
});

export default TetrisGame;