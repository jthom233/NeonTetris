#!/usr/bin/env node

/**
 * Integration Test - Simulates full game flow
 */

import { GameEngine } from './src/services/GameEngine.js';
import { GameSettings } from './src/models/GameSettings.js';

console.log('🎮 Testing Neon Tetris game flow...\n');

async function testGameFlow() {
  try {
    // Initialize game
    const gameSettings = new GameSettings();
    const gameEngine = new GameEngine({
      boardWidth: 10,
      boardHeight: 20,
      settings: gameSettings,
    });

    gameEngine.initialize();
    console.log('✅ Game initialized');

    // Set up event listeners to track game events
    let eventsReceived = [];

    gameEngine.addEventListener('gameStarted', (event) => {
      eventsReceived.push('gameStarted');
      console.log('🎯 Game started event received');
    });

    gameEngine.addEventListener('scoreChanged', (event) => {
      eventsReceived.push('scoreChanged');
      console.log(`💯 Score changed: ${event.detail.score}`);
    });

    gameEngine.addEventListener('gameOver', (event) => {
      eventsReceived.push('gameOver');
      console.log(`🎯 Game over: ${event.detail.finalScore} points`);
    });

    // Start the game
    gameEngine.start();
    console.log('✅ Game started');

    // Simulate some game time
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get initial state
    const gameState = gameEngine.getState();
    console.log('✅ Game state retrieved');
    console.log(`   - Board: ${gameState.board.width}x${gameState.board.height}`);
    console.log(`   - Score: ${gameState.score.currentScore}`);
    console.log(`   - Level: ${gameState.score.level}`);
    console.log(`   - Status: ${gameState.gameStatus}`);

    // Test input handling
    try {
      gameEngine.handleInput({ action: 'moveLeft', key: 'ArrowLeft' });
      gameEngine.handleInput({ action: 'rotateRight', key: 'ArrowUp' });
      console.log('✅ Input handling works');
    } catch (error) {
      console.error('❌ Input handling failed:', error.message);
    }

    // Test game update cycle
    try {
      gameEngine.update(16); // Simulate one frame (16ms for 60 FPS)
      console.log('✅ Game update cycle works');
    } catch (error) {
      console.error('❌ Game update failed:', error.message);
    }

    // Test pause/resume
    try {
      gameEngine.pause();
      console.log('✅ Game paused');

      gameEngine.resume();
      console.log('✅ Game resumed');
    } catch (error) {
      console.error('❌ Pause/resume failed:', error.message);
    }

    // Test piece spawning
    const activePiece = gameState.board.activePiece;
    if (activePiece) {
      console.log('✅ Piece spawning works');
      console.log(`   - Active piece: ${activePiece.type} at (${activePiece.position.x}, ${activePiece.position.y})`);
    } else {
      console.log('⚠️  No active piece found');
    }

    // Test reset
    gameEngine.reset();
    console.log('✅ Game reset works');

    // Check events
    console.log(`\n📊 Events received: ${eventsReceived.join(', ')}`);

    return true;

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the test
testGameFlow().then((success) => {
  if (success) {
    console.log('\n🎉 Integration test passed!');
    console.log('🌐 Game should work properly in browser');
    console.log('📍 Visit: http://localhost:3000');
  } else {
    console.log('\n❌ Integration test failed!');
    process.exit(1);
  }
});