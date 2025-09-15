/**
 * GameState - Central state container for all game data and status
 */
import { GameBoard } from './GameBoard.js';
import { Score } from './Score.js';
import { GameSettings } from './GameSettings.js';

export class GameState {
  static STATUS = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    LOADING: 'loading',
  };

  constructor(config = {}) {
    this.board = new GameBoard(config.boardWidth, config.boardHeight);
    this.score = new Score();
    this.level = 1;
    this.linesCleared = 0;
    this.gameStatus = GameState.STATUS.MENU;
    this.startTime = null;
    this.lastUpdate = new Date();
    this.settings = new GameSettings(config.settings);

    // Game timing
    this.lastPieceDrop = 0;
    this.dropInterval = this.score.getFallSpeed();
    this.lockDelay = 500; // 500ms lock delay
    this.lockTimer = 0;

    // Game statistics
    this.totalPieces = 0;
    this.gameTime = 0;
    this.isPaused = false;
    this.pauseStartTime = null;
    this.totalPauseTime = 0;
  }

  start() {
    if (this.gameStatus !== GameState.STATUS.MENU &&
        this.gameStatus !== GameState.STATUS.GAME_OVER) {
      throw new Error(`Cannot start game from status: ${this.gameStatus}`);
    }

    this.reset();
    this.gameStatus = GameState.STATUS.PLAYING;
    this.startTime = new Date();
    this.lastUpdate = new Date();
    this.isPaused = false;
  }

  pause() {
    if (this.gameStatus !== GameState.STATUS.PLAYING) {
      throw new Error(`Cannot pause game from status: ${this.gameStatus}`);
    }

    this.gameStatus = GameState.STATUS.PAUSED;
    this.isPaused = true;
    this.pauseStartTime = new Date();
  }

  resume() {
    if (this.gameStatus !== GameState.STATUS.PAUSED) {
      throw new Error(`Cannot resume game from status: ${this.gameStatus}`);
    }

    this.gameStatus = GameState.STATUS.PLAYING;
    this.isPaused = false;

    if (this.pauseStartTime) {
      this.totalPauseTime += new Date() - this.pauseStartTime;
      this.pauseStartTime = null;
    }

    this.lastUpdate = new Date();
  }

  gameOver() {
    this.gameStatus = GameState.STATUS.GAME_OVER;
    this.isPaused = false;

    // Calculate final game time
    if (this.startTime) {
      this.gameTime = (new Date() - this.startTime - this.totalPauseTime) / 1000;
    }

    return {
      finalScore: this.score.currentScore,
      level: this.score.level,
      lines: this.score.totalLines,
      duration: this.gameTime,
      totalPieces: this.totalPieces,
    };
  }

  reset() {
    this.board.reset();
    this.score.reset();
    this.level = 1;
    this.linesCleared = 0;
    this.totalPieces = 0;
    this.gameTime = 0;
    this.totalPauseTime = 0;
    this.lastPieceDrop = 0;
    this.lockTimer = 0;
    this.dropInterval = this.score.getFallSpeed();
    this.pauseStartTime = null;
    this.lastUpdate = new Date();
  }

  update(deltaTime) {
    if (this.gameStatus !== GameState.STATUS.PLAYING) {
      return;
    }

    this.lastUpdate = new Date();

    // Update drop timing
    this.lastPieceDrop += deltaTime;

    // Update lock delay timer if piece is at bottom
    if (this.board.activePiece && this.isPieceAtBottom()) {
      this.lockTimer += deltaTime;
    } else {
      this.lockTimer = 0;
    }

    // Update drop interval based on current level
    this.dropInterval = this.score.getFallSpeed();
    this.level = this.score.level;
  }

  isPieceAtBottom() {
    if (!this.board.activePiece) return false;

    return !this.board.isValidPosition(
      this.board.activePiece,
      this.board.activePiece.position.x,
      this.board.activePiece.position.y + 1,
    );
  }

  shouldDropPiece() {
    return this.lastPieceDrop >= this.dropInterval;
  }

  shouldLockPiece() {
    return this.lockTimer >= this.lockDelay;
  }

  resetDropTimer() {
    this.lastPieceDrop = 0;
  }

  resetLockTimer() {
    this.lockTimer = 0;
  }

  addPiece() {
    this.totalPieces++;
  }

  processLineClears(lineCount) {
    if (lineCount > 0) {
      const result = this.score.addLineClears(lineCount);
      this.linesCleared += lineCount;
      this.level = this.score.level;
      return result;
    }
    return null;
  }

  getGameDuration() {
    if (!this.startTime) return 0;

    let endTime = new Date();
    if (this.gameStatus === GameState.STATUS.GAME_OVER) {
      endTime = this.lastUpdate;
    }

    return (endTime - this.startTime - this.totalPauseTime) / 1000;
  }

  isGameActive() {
    return this.gameStatus === GameState.STATUS.PLAYING;
  }

  isGamePaused() {
    return this.gameStatus === GameState.STATUS.PAUSED;
  }

  isGameOver() {
    return this.gameStatus === GameState.STATUS.GAME_OVER;
  }

  canAcceptInput() {
    return this.gameStatus === GameState.STATUS.PLAYING;
  }

  clone() {
    const cloned = new GameState();
    cloned.board = this.board.clone();
    cloned.score = this.score.clone();
    cloned.level = this.level;
    cloned.linesCleared = this.linesCleared;
    cloned.gameStatus = this.gameStatus;
    cloned.startTime = this.startTime ? new Date(this.startTime) : null;
    cloned.lastUpdate = new Date(this.lastUpdate);
    cloned.settings = this.settings.clone();
    cloned.totalPieces = this.totalPieces;
    cloned.gameTime = this.gameTime;
    cloned.lastPieceDrop = this.lastPieceDrop;
    cloned.dropInterval = this.dropInterval;
    cloned.lockTimer = this.lockTimer;
    cloned.isPaused = this.isPaused;
    cloned.totalPauseTime = this.totalPauseTime;
    return cloned;
  }

  toJSON() {
    return {
      board: this.board,
      score: this.score.toJSON(),
      level: this.level,
      linesCleared: this.linesCleared,
      gameStatus: this.gameStatus,
      startTime: this.startTime ? this.startTime.toISOString() : null,
      lastUpdate: this.lastUpdate.toISOString(),
      settings: this.settings.toJSON(),
      totalPieces: this.totalPieces,
      gameTime: this.gameTime,
      lastPieceDrop: this.lastPieceDrop,
      dropInterval: this.dropInterval,
      lockTimer: this.lockTimer,
      totalPauseTime: this.totalPauseTime,
    };
  }

  static fromJSON(data) {
    const gameState = new GameState();

    if (data.board) {
      // Reconstruct board from JSON data
      gameState.board = data.board;
    }

    if (data.score) {
      gameState.score = Score.fromJSON(data.score);
    }

    gameState.level = data.level || 1;
    gameState.linesCleared = data.linesCleared || 0;
    gameState.gameStatus = data.gameStatus || GameState.STATUS.MENU;
    gameState.startTime = data.startTime ? new Date(data.startTime) : null;
    gameState.lastUpdate = data.lastUpdate ? new Date(data.lastUpdate) : new Date();
    gameState.totalPieces = data.totalPieces || 0;
    gameState.gameTime = data.gameTime || 0;
    gameState.lastPieceDrop = data.lastPieceDrop || 0;
    gameState.dropInterval = data.dropInterval || 1000;
    gameState.lockTimer = data.lockTimer || 0;
    gameState.totalPauseTime = data.totalPauseTime || 0;

    if (data.settings) {
      gameState.settings = GameSettings.fromJSON(data.settings);
    }

    return gameState;
  }
}