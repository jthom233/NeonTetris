/**
 * GameEngine - Core game loop and state management
 */
import { GameState } from '../models/GameState.js';
import { Tetromino } from '../models/Tetromino.js';

export class GameEngine extends EventTarget {
  constructor(config = {}) {
    super();

    this.config = {
      boardWidth: 10,
      boardHeight: 20,
      spawnX: 4,
      spawnY: 0,
      ...config,
    };

    this.gameState = null;
    this.isRunning = false;
    this.isPaused = false;
    this.animationId = null;
    this.lastTime = 0;

    // Piece spawning
    this.pieceQueue = [];
    this.queueSize = 3;

    // Performance tracking
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.currentFps = 0;
  }

  initialize(gameConfig = {}) {
    if (this.isRunning) {
      throw new Error('Cannot initialize while game is running');
    }

    this.config = { ...this.config, ...gameConfig };
    this.gameState = new GameState(this.config);
    this.pieceQueue = [];

    // Pre-fill piece queue
    this.fillPieceQueue();

    this.dispatchEvent(
      new CustomEvent('initialized', {
        detail: { config: this.config },
      })
    );
  }

  start() {
    if (!this.gameState) {
      throw new Error('Game engine not initialized');
    }

    if (this.isRunning) {
      throw new Error('Game is already running');
    }

    this.gameState.start();
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    // Spawn first piece
    this.spawnNextPiece();

    // Start game loop
    this.gameLoop(this.lastTime);

    this.dispatchEvent(
      new CustomEvent('gameStarted', {
        detail: { gameState: this.gameState.clone() },
      })
    );
  }

  pause() {
    if (!this.isRunning) {
      throw new Error('Game is not running');
    }

    if (this.isPaused) {
      throw new Error('Game is already paused');
    }

    this.gameState.pause();
    this.isPaused = true;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.dispatchEvent(
      new CustomEvent('gamePaused', {
        detail: { gameState: this.gameState.clone() },
      })
    );
  }

  resume() {
    if (!this.isRunning) {
      throw new Error('Game is not running');
    }

    if (!this.isPaused) {
      throw new Error('Game is not paused');
    }

    this.gameState.resume();
    this.isPaused = false;
    this.lastTime = performance.now();

    // Restart game loop
    this.gameLoop(this.lastTime);

    this.dispatchEvent(
      new CustomEvent('gameResumed', {
        detail: { gameState: this.gameState.clone() },
      })
    );
  }

  reset() {
    this.stop();

    if (this.gameState) {
      this.gameState.reset();
      this.pieceQueue = [];
      this.fillPieceQueue();
    }

    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.currentFps = 0;

    this.dispatchEvent(
      new CustomEvent('gameReset', {
        detail: { gameState: this.gameState?.clone() },
      })
    );
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  gameLoop(currentTime) {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game state
    this.update(deltaTime);

    // Track FPS
    this.updateFps(currentTime);

    // Continue game loop
    this.animationId = requestAnimationFrame(time => this.gameLoop(time));
  }

  update(deltaTime) {
    if (!this.gameState || !this.gameState.isGameActive()) {
      return this.gameState;
    }

    // Update game timing
    this.gameState.update(deltaTime);

    // Handle automatic piece dropping
    if (this.gameState.shouldDropPiece()) {
      this.dropActivePiece();
      this.gameState.resetDropTimer();
    }

    // Handle piece locking
    if (this.gameState.board.activePiece && this.gameState.shouldLockPiece()) {
      this.lockActivePiece();
    }

    // Check for game over
    if (this.gameState.board.isGameOver()) {
      this.endGame();
    }

    this.dispatchEvent(
      new CustomEvent('gameStateChanged', {
        detail: {
          oldState: this.gameState.clone(),
          newState: this.gameState.clone(),
        },
      })
    );

    return this.gameState;
  }

  handleInput(inputEvent) {
    if (!this.gameState || !this.gameState.canAcceptInput()) {
      return;
    }

    const { action, key } = inputEvent;

    switch (action) {
      case 'moveLeft':
        this.moveActivePiece(-1, 0);
        break;
      case 'moveRight':
        this.moveActivePiece(1, 0);
        break;
      case 'softDrop':
        this.softDropActivePiece();
        break;
      case 'hardDrop':
        this.hardDropActivePiece();
        break;
      case 'rotateLeft':
        this.rotateActivePiece(-1);
        break;
      case 'rotateRight':
        this.rotateActivePiece(1);
        break;
      case 'pause':
        if (this.isPaused) {
          this.resume();
        } else {
          this.pause();
        }
        break;
      case 'restart':
        this.reset();
        break;
      default:
        throw new Error(`Unknown input action: ${action}`);
    }
  }

  moveActivePiece(deltaX, deltaY) {
    const piece = this.gameState.board.activePiece;
    if (!piece) return false;

    const newX = piece.position.x + deltaX;
    const newY = piece.position.y + deltaY;

    if (this.gameState.board.isValidPosition(piece, newX, newY)) {
      piece.moveTo(newX, newY);
      this.gameState.board.updateGhostPiece(piece);

      // Reset lock delay when piece moves
      if (deltaY === 0) {
        this.gameState.resetLockTimer();
      }

      return true;
    }

    return false;
  }

  rotateActivePiece(direction = 1) {
    const piece = this.gameState.board.activePiece;
    if (!piece) return false;

    const originalRotation = piece.rotation;
    piece.rotate(direction);

    // Try standard rotation
    if (this.gameState.board.isValidPosition(piece, piece.position.x, piece.position.y)) {
      this.gameState.board.updateGhostPiece(piece);
      this.gameState.resetLockTimer();
      return true;
    }

    // Try wall kick offsets
    const wallKickOffsets = this.getWallKickOffsets(piece.type, originalRotation, piece.rotation);

    for (const offset of wallKickOffsets) {
      const testX = piece.position.x + offset.x;
      const testY = piece.position.y + offset.y;

      if (this.gameState.board.isValidPosition(piece, testX, testY)) {
        piece.moveTo(testX, testY);
        this.gameState.board.updateGhostPiece(piece);
        this.gameState.resetLockTimer();
        return true;
      }
    }

    // Rotation failed, revert
    piece.rotation = originalRotation;
    return false;
  }

  getWallKickOffsets(pieceType, fromRotation, toRotation) {
    // Simplified wall kick system
    const offsets = [
      { x: 0, y: 0 }, // No offset
      { x: -1, y: 0 }, // Left
      { x: 1, y: 0 }, // Right
      { x: 0, y: -1 }, // Up
      { x: -1, y: -1 }, // Left-up
      { x: 1, y: -1 }, // Right-up
    ];

    return offsets;
  }

  dropActivePiece() {
    if (this.moveActivePiece(0, 1)) {
      return true;
    }

    // Piece couldn't move down, start lock delay
    return false;
  }

  softDropActivePiece() {
    if (this.moveActivePiece(0, 1)) {
      // Award soft drop points
      const pointsAwarded = this.gameState.score.addSoftDrop(1);

      this.dispatchEvent(
        new CustomEvent('scoreChanged', {
          detail: {
            score: this.gameState.score.currentScore,
            level: this.gameState.score.level,
            lines: this.gameState.score.lines,
            pointsAwarded,
          },
        })
      );

      return true;
    }

    return false;
  }

  hardDropActivePiece() {
    const piece = this.gameState.board.activePiece;
    if (!piece) return;

    const dropPosition = this.gameState.board.getDropPosition(piece);
    if (dropPosition) {
      const dropDistance = dropPosition.y - piece.position.y;
      piece.moveTo(dropPosition.x, dropPosition.y);

      // Award hard drop points
      const pointsAwarded = this.gameState.score.addHardDrop(dropDistance);

      this.dispatchEvent(
        new CustomEvent('scoreChanged', {
          detail: {
            score: this.gameState.score.currentScore,
            level: this.gameState.score.level,
            lines: this.gameState.score.lines,
            pointsAwarded,
          },
        })
      );

      // Immediately lock the piece
      this.lockActivePiece();
    }
  }

  lockActivePiece() {
    const piece = this.gameState.board.activePiece;
    if (!piece) return;

    // Place piece on board
    this.gameState.board.placePiece(piece);
    this.gameState.board.activePiece = null;
    this.gameState.board.ghostPiece = null;

    // Check for completed lines
    const completedLines = this.gameState.board.getCompletedLines();

    if (completedLines.length > 0) {
      this.clearLines(completedLines);
    }

    // Spawn next piece
    this.spawnNextPiece();

    this.gameState.resetLockTimer();
  }

  clearLines(lineIndices) {
    const lineCount = lineIndices.length;

    // Clear the lines with animation event
    this.dispatchEvent(
      new CustomEvent('lineCleared', {
        detail: {
          lines: lineIndices,
          linesCleared: lineCount,
          isTetris: lineCount === 4,
        },
      })
    );

    // Remove lines from board
    this.gameState.board.clearLines(lineIndices);

    // Update score
    const scoreResult = this.gameState.processLineClears(lineCount);

    if (scoreResult) {
      this.dispatchEvent(
        new CustomEvent('scoreChanged', {
          detail: {
            score: this.gameState.score.currentScore,
            level: this.gameState.score.level,
            lines: this.gameState.score.totalLines,
            linesCleared: lineCount,
            ...scoreResult,
          },
        })
      );

      if (scoreResult.leveledUp) {
        this.dispatchEvent(
          new CustomEvent('levelUp', {
            detail: {
              newLevel: this.gameState.score.level,
              requiredLines: this.gameState.score.totalLines,
            },
          })
        );
      }
    }
  }

  spawnNextPiece() {
    if (this.pieceQueue.length === 0) {
      this.fillPieceQueue();
    }

    const nextPieceType = this.pieceQueue.shift();
    const newPiece = new Tetromino(nextPieceType, {
      x: this.config.spawnX,
      y: this.config.spawnY,
    });

    // Check if spawn position is valid
    if (!this.gameState.board.isValidPosition(newPiece, newPiece.position.x, newPiece.position.y)) {
      this.endGame();
      return;
    }

    this.gameState.board.activePiece = newPiece;
    this.gameState.board.updateGhostPiece(newPiece);
    this.gameState.addPiece();

    // Set next piece preview
    if (this.pieceQueue.length > 0) {
      this.gameState.board.nextPiece = new Tetromino(this.pieceQueue[0]);
    }

    // Refill queue if needed
    if (this.pieceQueue.length < this.queueSize) {
      this.fillPieceQueue();
    }
  }

  fillPieceQueue() {
    while (this.pieceQueue.length < this.queueSize * 2) {
      // Use 7-bag system for fair piece distribution
      const bag = [...Tetromino.TYPES];
      this.shuffleArray(bag);
      this.pieceQueue.push(...bag);
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  endGame() {
    const gameOverData = this.gameState.gameOver();
    this.stop();

    this.dispatchEvent(
      new CustomEvent('gameOver', {
        detail: gameOverData,
      })
    );
  }

  updateFps(currentTime) {
    this.frameCount++;

    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
  }

  getState() {
    return this.gameState ? this.gameState.clone() : null;
  }

  isGameRunning() {
    return this.isRunning;
  }

  isGamePaused() {
    return this.isPaused;
  }

  getFps() {
    return this.currentFps;
  }

  getPerformanceMetrics() {
    return {
      fps: this.currentFps,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      frameCount: this.frameCount,
    };
  }
}
