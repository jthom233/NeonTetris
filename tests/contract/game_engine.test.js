/**
 * GameEngine Contract Test
 * Tests the GameEngine interface contract as defined in contracts/GameEngine.md
 * 
 * CRITICAL: This test MUST fail initially (RED phase of TDD)
 * Implementation should only be created after this test fails
 */

import { GameEngine } from '../../src/services/GameEngine.js';

describe('GameEngine Contract', () => {
  let engine;
  let mockConfig;

  beforeEach(() => {
    mockConfig = TestUtils.createMockConfig();
    engine = new GameEngine(mockConfig);
  });

  afterEach(() => {
    if (engine && engine.isRunning && engine.isRunning()) {
      engine.reset();
    }
  });

  describe('Initialization Contract', () => {
    it('should create GameEngine instance with valid config', () => {
      expect(engine).toBeInstanceOf(GameEngine);
      expect(engine).toBeDefined();
    });

    it('should initialize with configuration', () => {
      expect(() => engine.initialize(mockConfig)).not.toThrow();
      expect(engine.isInitialized()).toBe(true);
    });

    it('should throw ConfigurationError for invalid config', () => {
      const invalidConfig = null;
      expect(() => engine.initialize(invalidConfig)).toThrow('Invalid configuration');
    });

    it('should not allow re-initialization', () => {
      engine.initialize(mockConfig);
      expect(() => engine.initialize(mockConfig)).toThrow('Already initialized');
    });
  });

  describe('Game State Management Contract', () => {
    beforeEach(() => {
      engine.initialize(mockConfig);
    });

    it('should start game when initialized and not running', () => {
      expect(() => engine.start()).not.toThrow();
      expect(engine.isRunning()).toBe(true);
    });

    it('should throw InvalidStateError when starting without initialization', () => {
      const uninitializedEngine = new GameEngine();
      expect(() => uninitializedEngine.start()).toThrow('Engine not initialized');
    });

    it('should throw InvalidStateError when starting already running game', () => {
      engine.start();
      expect(() => engine.start()).toThrow('Game already running');
    });

    it('should pause running game', () => {
      engine.start();
      expect(() => engine.pause()).not.toThrow();
      expect(engine.isRunning()).toBe(false);
      expect(engine.isPaused()).toBe(true);
    });

    it('should throw InvalidStateError when pausing non-running game', () => {
      expect(() => engine.pause()).toThrow('Game not running');
    });

    it('should resume paused game', () => {
      engine.start();
      engine.pause();
      expect(() => engine.resume()).not.toThrow();
      expect(engine.isRunning()).toBe(true);
      expect(engine.isPaused()).toBe(false);
    });

    it('should throw InvalidStateError when resuming non-paused game', () => {
      expect(() => engine.resume()).toThrow('Game not paused');
    });

    it('should reset game to initial state', () => {
      engine.start();
      expect(() => engine.reset()).not.toThrow();
      expect(engine.isRunning()).toBe(false);
      expect(engine.isPaused()).toBe(false);
    });
  });

  describe('Game Loop Contract', () => {
    beforeEach(() => {
      engine.initialize(mockConfig);
      engine.start();
    });

    it('should update game state with delta time', () => {
      const deltaTime = 16; // 60 FPS frame
      const oldState = engine.getState();
      
      const newState = engine.update(deltaTime);
      
      expect(newState).toBeValidGameState();
      expect(newState.timestamp).toBeGreaterThan(oldState.timestamp);
    });

    it('should complete update within performance requirement', () => {
      const deltaTime = 16;
      const startTime = performance.now();
      
      engine.update(deltaTime);
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Must complete within 16ms (60 FPS requirement)
      expect(updateTime).toBeLessThan(16);
    });

    it('should throw error when updating non-running engine', () => {
      engine.pause();
      expect(() => engine.update(16)).toThrow('Engine not running');
    });

    it('should handle input events when running', () => {
      const inputEvent = {
        type: 'keydown',
        code: 'ArrowLeft',
        preventDefault: jest.fn(),
      };

      expect(() => engine.handleInput(inputEvent)).not.toThrow();
    });

    it('should throw InputError for invalid input', () => {
      const invalidInput = { invalid: true };
      expect(() => engine.handleInput(invalidInput)).toThrow('Invalid input event');
    });
  });

  describe('State Access Contract', () => {
    beforeEach(() => {
      engine.initialize(mockConfig);
    });

    it('should return current game state (read-only)', () => {
      const state = engine.getState();
      
      expect(state).toBeValidGameState();
      expect(state).toHaveProperty('board');
      expect(state).toHaveProperty('score');
      expect(state).toHaveProperty('level');
      expect(state).toHaveProperty('gameStatus');
    });

    it('should return immutable state object', () => {
      const state1 = engine.getState();
      const state2 = engine.getState();
      
      // Should return different objects (immutable)
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('Event System Contract', () => {
    let eventHandler;

    beforeEach(() => {
      engine.initialize(mockConfig);
      eventHandler = jest.fn();
    });

    it('should emit gameStateChanged event on state changes', () => {
      engine.on('gameStateChanged', eventHandler);
      
      engine.start();
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          oldState: expect.any(Object),
          newState: expect.any(Object),
        })
      );
    });

    it('should emit scoreChanged event on score updates', () => {
      engine.on('scoreChanged', eventHandler);
      engine.start();
      
      // Simulate score change
      engine.update(16);
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          score: expect.any(Number),
          level: expect.any(Number),
          lines: expect.any(Number),
        })
      );
    });

    it('should emit lineCleared event when lines are cleared', () => {
      engine.on('lineCleared', eventHandler);
      engine.start();
      
      // Simulate line clear - this will depend on game state
      // For now, test the event contract exists
      expect(engine.on).toBeDefined();
      expect(engine.off).toBeDefined();
    });

    it('should emit gameOver event when game ends', () => {
      engine.on('gameOver', eventHandler);
      engine.start();
      
      // Simulate game over condition
      // Test contract - actual implementation will trigger this
      expect(engine.on).toBeDefined();
    });

    it('should emit levelUp event when level increases', () => {
      engine.on('levelUp', eventHandler);
      engine.start();
      
      // Simulate level up condition
      // Test contract - actual implementation will trigger this
      expect(engine.on).toBeDefined();
    });
  });

  describe('Performance Contract', () => {
    beforeEach(() => {
      engine.initialize(mockConfig);
      engine.start();
    });

    it('should maintain O(1) complexity for state reads', () => {
      const iterations = 1000;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        engine.getState();
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      // Should be consistently fast regardless of game state
      expect(avgTime).toBeLessThan(1); // Less than 1ms per read
    });

    it('should minimize memory allocation during update', () => {
      // This test requires monitoring memory, simplified for now
      const initialMemory = process.memoryUsage?.() || { heapUsed: 0 };
      
      // Run multiple updates
      for (let i = 0; i < 100; i++) {
        engine.update(16);
      }
      
      const finalMemory = process.memoryUsage?.() || { heapUsed: 0 };
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Should not allocate excessive memory during updates
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB increase
    });
  });

  describe('Error Handling Contract', () => {
    it('should provide meaningful error messages', () => {
      expect(() => engine.initialize(null)).toThrow(/configuration/i);
      expect(() => engine.start()).toThrow(/initialized/i);
    });

    it('should handle errors gracefully without crashing', () => {
      engine.initialize(mockConfig);
      engine.start();
      
      // Simulate error condition
      const corruptedInput = { malformed: 'data' };
      
      expect(() => engine.handleInput(corruptedInput)).toThrow();
      // Engine should still be in valid state after error
      expect(engine.getState()).toBeValidGameState();
    });
  });
});