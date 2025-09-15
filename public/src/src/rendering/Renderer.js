/**
 * Renderer - Canvas-based neon graphics rendering
 */
export class Renderer extends EventTarget {
  constructor() {
    super();

    this.canvas = null;
    this.ctx = null;
    this.theme = null;
    this.isInitialized = false;

    // Rendering settings
    this.blockSize = 30;
    this.gridLineWidth = 1;
    this.neonGlowSize = 10;

    // Performance tracking
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.currentFps = 0;
    this.frameTimeHistory = [];
    this.maxFrameHistory = 60;

    // Animation state
    this.animations = new Map();
    this.animationId = 0;
  }

  initialize(canvas, theme = this.getDefaultTheme()) {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Valid canvas element required');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    if (!this.ctx) {
      throw new Error('Could not get 2D rendering context');
    }

    this.setTheme(theme);
    this.setupCanvas();
    this.isInitialized = true;

    this.dispatchEvent(
      new CustomEvent('initialized', {
        detail: { canvas, theme },
      })
    );
  }

  getDefaultTheme() {
    return {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      background: '#000011',
      glowIntensity: 0.8,
      pulseSpeed: 1.0,
    };
  }

  setTheme(theme) {
    this.validateTheme(theme);
    this.theme = { ...this.getDefaultTheme(), ...theme };
  }

  validateTheme(theme) {
    if (!theme || typeof theme !== 'object') {
      throw new Error('Theme must be an object');
    }

    const requiredColors = ['primary', 'secondary', 'accent', 'background'];
    for (const color of requiredColors) {
      if (!theme[color] || !this.isValidColor(theme[color])) {
        throw new Error(`Invalid or missing color: ${color}`);
      }
    }

    if (theme.glowIntensity !== undefined) {
      if (
        typeof theme.glowIntensity !== 'number' ||
        theme.glowIntensity < 0 ||
        theme.glowIntensity > 1
      ) {
        throw new Error('glowIntensity must be a number between 0 and 1');
      }
    }
  }

  isValidColor(color) {
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
  }

  setupCanvas() {
    // Set canvas size for game board (10x20) plus UI space
    const boardWidth = 10 * this.blockSize;
    const boardHeight = 20 * this.blockSize;
    const uiWidth = 200;

    this.canvas.width = boardWidth + uiWidth;
    this.canvas.height = boardHeight + 100; // Extra space for top UI

    // Enable image smoothing for better neon effects
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Set initial styles
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
  }

  render(gameState) {
    if (!this.isInitialized) {
      throw new Error('Renderer not initialized');
    }

    if (!gameState) {
      throw new Error('Game state is required');
    }

    const startTime = performance.now();

    // Clear canvas
    this.clear();

    // Render game elements
    this.renderBackground();
    this.renderBoard(gameState.board);
    this.renderUI(gameState.score, gameState.level);

    // Update performance metrics
    this.updatePerformanceMetrics(performance.now() - startTime);

    this.dispatchEvent(
      new CustomEvent('renderComplete', {
        detail: {
          frameTime: performance.now() - startTime,
          timestamp: performance.now(),
        },
      })
    );
  }

  clear() {
    this.ctx.fillStyle = this.theme.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderBackground() {
    // Render subtle neon grid pattern
    this.ctx.strokeStyle = this.addAlpha(this.theme.primary, 0.1);
    this.ctx.lineWidth = 0.5;

    const gridSize = 20;
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  renderBoard(board) {
    const offsetX = 50;
    const offsetY = 50;

    // Render grid lines
    this.renderGridLines(offsetX, offsetY, board.width, board.height);

    // Render placed pieces
    this.renderPlacedPieces(board, offsetX, offsetY);

    // Render ghost piece
    if (board.ghostPiece) {
      this.renderPiece(board.ghostPiece, offsetX, offsetY, true);
    }

    // Render active piece
    if (board.activePiece) {
      this.renderPiece(board.activePiece, offsetX, offsetY, false);
    }
  }

  renderGridLines(offsetX, offsetY, width, height) {
    this.ctx.strokeStyle = this.addAlpha(this.theme.primary, 0.3);
    this.ctx.lineWidth = this.gridLineWidth;

    // Vertical lines
    for (let x = 0; x <= width; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX + x * this.blockSize, offsetY);
      this.ctx.lineTo(offsetX + x * this.blockSize, offsetY + height * this.blockSize);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, offsetY + y * this.blockSize);
      this.ctx.lineTo(offsetX + width * this.blockSize, offsetY + y * this.blockSize);
      this.ctx.stroke();
    }
  }

  renderPlacedPieces(board, offsetX, offsetY) {
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const cell = board.grid[y][x];
        if (cell) {
          this.renderBlock(
            offsetX + x * this.blockSize,
            offsetY + y * this.blockSize,
            this.blockSize,
            cell.color,
            false
          );
        }
      }
    }
  }

  renderPiece(piece, offsetX, offsetY, isGhost = false) {
    if (!piece) return;

    const shape = piece.getRotatedShape();
    const alpha = isGhost ? 0.3 : 1.0;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const x = offsetX + (piece.position.x + col) * this.blockSize;
          const y = offsetY + (piece.position.y + row) * this.blockSize;

          // Only render if within visible area
          if (y >= offsetY - this.blockSize) {
            this.renderBlock(x, y, this.blockSize, piece.color, isGhost, alpha);
          }
        }
      }
    }
  }

  renderBlock(x, y, size, color, isGhost = false, alpha = 1.0) {
    const glowSize = this.neonGlowSize * this.theme.glowIntensity;

    this.ctx.save();

    // Create neon glow effect
    if (!isGhost) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = glowSize;
      this.ctx.globalAlpha = alpha;
    } else {
      this.ctx.globalAlpha = alpha * 0.5;
    }

    // Fill block
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

    // Add border for extra neon effect
    if (!isGhost) {
      this.ctx.strokeStyle = this.lightenColor(color, 0.3);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    }

    this.ctx.restore();
  }

  renderUI(score, level) {
    const uiX = 10 * this.blockSize + 70;
    const uiY = 70;

    this.renderScoreDisplay(uiX, uiY, score);
    this.renderLevelDisplay(uiX, uiY + 100, level);
    this.renderNextPiece(uiX, uiY + 200);
  }

  renderScoreDisplay(x, y, score) {
    this.ctx.save();

    // Title
    this.ctx.fillStyle = this.theme.accent;
    this.ctx.font = 'bold 16px Arial';
    this.ctx.shadowColor = this.theme.accent;
    this.ctx.shadowBlur = 5;
    this.ctx.fillText('SCORE', x, y);

    // Score value
    this.ctx.fillStyle = this.theme.primary;
    this.ctx.font = 'bold 20px Arial';
    this.ctx.shadowColor = this.theme.primary;
    this.ctx.shadowBlur = 8;
    this.ctx.fillText(score.currentScore.toLocaleString(), x, y + 30);

    // Lines
    this.ctx.fillStyle = this.theme.secondary;
    this.ctx.font = '14px Arial';
    this.ctx.shadowBlur = 3;
    this.ctx.fillText(`Lines: ${score.totalLines}`, x, y + 55);

    this.ctx.restore();
  }

  renderLevelDisplay(x, y, level) {
    this.ctx.save();

    this.ctx.fillStyle = this.theme.accent;
    this.ctx.font = 'bold 16px Arial';
    this.ctx.shadowColor = this.theme.accent;
    this.ctx.shadowBlur = 5;
    this.ctx.fillText('LEVEL', x, y);

    this.ctx.fillStyle = this.theme.primary;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.shadowColor = this.theme.primary;
    this.ctx.shadowBlur = 8;
    this.ctx.fillText(level.toString(), x, y + 35);

    this.ctx.restore();
  }

  renderNextPiece(x, y) {
    // Implementation for next piece preview
    this.ctx.save();

    this.ctx.fillStyle = this.theme.accent;
    this.ctx.font = 'bold 16px Arial';
    this.ctx.shadowColor = this.theme.accent;
    this.ctx.shadowBlur = 5;
    this.ctx.fillText('NEXT', x, y);

    // Draw preview box
    this.ctx.strokeStyle = this.theme.primary;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y + 10, 120, 80);

    this.ctx.restore();
  }

  animateLineClear(lines) {
    return new Promise(resolve => {
      const animationId = this.animationId++;
      const duration = 500; // 500ms animation
      const startTime = performance.now();

      const animate = currentTime => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Flash effect for cleared lines
        const alpha = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;

        // Render flash effect
        this.ctx.save();
        this.ctx.fillStyle = this.addAlpha(this.theme.accent, alpha);

        for (const lineIndex of lines) {
          const y = 50 + lineIndex * this.blockSize;
          this.ctx.fillRect(50, y, 10 * this.blockSize, this.blockSize);
        }

        this.ctx.restore();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.dispatchEvent(
            new CustomEvent('animationComplete', {
              detail: {
                animationType: 'lineClear',
                duration: elapsed,
              },
            })
          );
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  setFrameRate(fps) {
    if (typeof fps !== 'number' || fps <= 0) {
      throw new Error('FPS must be a positive number');
    }

    this.targetFps = fps;
    this.targetFrameTime = 1000 / fps;
  }

  getPerformanceMetrics() {
    const averageFrameTime =
      this.frameTimeHistory.length > 0
        ? this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length
        : 0;

    return {
      fps: this.currentFps,
      frameTime: averageFrameTime,
      droppedFrames: 0, // TODO: Implement dropped frame detection
      memoryUsage: 0, // TODO: Implement memory usage estimation
    };
  }

  updatePerformanceMetrics(frameTime) {
    this.frameCount++;
    this.frameTimeHistory.push(frameTime);

    if (this.frameTimeHistory.length > this.maxFrameHistory) {
      this.frameTimeHistory.shift();
    }

    const currentTime = performance.now();
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;

      // Check for performance warnings
      if (this.currentFps < 50 && this.targetFps >= 60) {
        this.dispatchEvent(
          new CustomEvent('performanceWarning', {
            detail: {
              currentFPS: this.currentFps,
              targetFPS: this.targetFps || 60,
            },
          })
        );
      }
    }
  }

  // Utility methods
  addAlpha(color, alpha) {
    // Convert hex color to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount * 255);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount * 255);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount * 255);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  destroy() {
    this.canvas = null;
    this.ctx = null;
    this.isInitialized = false;
    this.animations.clear();
  }
}
