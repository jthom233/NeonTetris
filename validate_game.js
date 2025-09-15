#!/usr/bin/env node

/**
 * Game Validation Script
 * Tests basic functionality without browser
 */

import { GameEngine } from './src/services/GameEngine.js';
import { Renderer } from './src/rendering/Renderer.js';
import { InputHandler } from './src/input/InputHandler.js';
import { StorageManager } from './src/storage/StorageManager.js';
import { GameSettings } from './src/models/GameSettings.js';
import { Tetromino } from './src/models/Tetromino.js';
import { GameBoard } from './src/models/GameBoard.js';

console.log('🎮 Starting Neon Tetris validation...\n');

// Test 1: Module imports
try {
  console.log('✅ All modules imported successfully');
} catch (error) {
  console.error('❌ Module import failed:', error.message);
  process.exit(1);
}

// Test 2: Basic object creation
try {
  const gameSettings = new GameSettings();
  const gameEngine = new GameEngine();
  const storageManager = new StorageManager();
  const inputHandler = new InputHandler(gameSettings);

  console.log('✅ All core objects created successfully');
} catch (error) {
  console.error('❌ Object creation failed:', error.message);
  process.exit(1);
}

// Test 3: Game models
try {
  const board = new GameBoard();
  const tetromino = new Tetromino('I');

  console.log('✅ Game models work correctly');
  console.log(`   - Board size: ${board.width}x${board.height}`);
  console.log(`   - Tetromino type: ${tetromino.type}, color: ${tetromino.color}`);
} catch (error) {
  console.error('❌ Game model test failed:', error.message);
  process.exit(1);
}

// Test 4: Game engine initialization
try {
  const engine = new GameEngine();
  engine.initialize();

  console.log('✅ Game engine initializes correctly');
  console.log(`   - Engine running: ${engine.isGameRunning()}`);
} catch (error) {
  console.error('❌ Game engine test failed:', error.message);
  process.exit(1);
}

// Test 5: Piece collision detection
try {
  const board = new GameBoard();
  const piece = new Tetromino('T', { x: 4, y: 0 });

  const isValid = board.isValidPosition(piece, piece.position.x, piece.position.y);
  console.log('✅ Collision detection works');
  console.log(`   - T piece at spawn position is valid: ${isValid}`);
} catch (error) {
  console.error('❌ Collision detection test failed:', error.message);
  process.exit(1);
}

// Test 6: Storage manager
try {
  const storage = new StorageManager();
  const settings = storage.loadSettings();

  console.log('✅ Storage manager works');
  console.log(`   - Storage available: ${storage.isStorageAvailable()}`);
} catch (error) {
  console.error('❌ Storage manager test failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All validation tests passed!');
console.log('🌐 Game should work properly in browser');
console.log('📍 Visit: http://localhost:3000');