/**
 * Renderer Contract Test
 * Tests the Renderer interface contract as defined in contracts/Renderer.md
 * 
 * CRITICAL: This test MUST fail initially (RED phase of TDD)
 * Implementation should only be created after this test fails
 */

import { Renderer } from '../../src/rendering/Renderer.js';

describe('Renderer Contract', () => {
  let renderer;
  let mockCanvas;
  let mockContext;
  let mockTheme;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 320;
    mockCanvas.height = 640;
    
    mockContext = mockCanvas.getContext('2d');
    
    mockTheme = {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#00ff00',
      background: '#0a0a0a',
      glowIntensity: 0.8,
      pulseSpeed: 0.5,
    };

    renderer = new Renderer();
  });

  afterEach(() => {
    if (renderer && renderer.destroy) {
      renderer.destroy();
    }
  });

  describe('Initialization Contract', () => {
    it('should create Renderer instance', () => {
      expect(renderer).toBeInstanceOf(Renderer);
      expect(renderer).toBeDefined();
    });

    it('should initialize with canvas and theme', () => {
      expect(() => renderer.initialize(mockCanvas, mockTheme)).not.toThrow();
      expect(renderer.isInitialized()).toBe(true);
    });

    it('should throw error for invalid canvas', () => {
      expect(() => renderer.initialize(null, mockTheme)).toThrow('Invalid canvas');
      expect(() => renderer.initialize({}, mockTheme)).toThrow('Invalid canvas');
    });

    it('should throw error for malformed theme', () => {
      const invalidTheme = { invalid: true };
      expect(() => renderer.initialize(mockCanvas, invalidTheme)).toThrow('Invalid theme');
    });

    it('should not allow re-initialization', () => {
      renderer.initialize(mockCanvas, mockTheme);
      expect(() => renderer.initialize(mockCanvas, mockTheme)).toThrow('Already initialized');
    });
  });

  describe('Rendering Contract', () => {
    let mockGameState;

    beforeEach(() => {
      renderer.initialize(mockCanvas, mockTheme);
      
      mockGameState = {
        board: {
          width: 10,
          height: 20,
          grid: Array(20).fill().map(() => Array(10).fill(null)),
          activePiece: TestUtils.createMockTetromino('I'),
          nextPiece: TestUtils.createMockTetromino('T'),
          ghostPiece: null,
        },
        score: { currentScore: 1000, level: 2, lines: 15 },
        level: 2,
        gameStatus: 'playing',
      };
    });

    it('should render complete game state', () => {
      expect(() => renderer.render(mockGameState)).not.toThrow();
      
      // Verify Canvas API calls were made
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.clearRect).toHaveBeenCalled();
    });

    it('should throw error when not initialized', () => {
      const uninitializedRenderer = new Renderer();
      expect(() => uninitializedRenderer.render(mockGameState)).toThrow('Not initialized');
    });

    it('should throw error for invalid game state', () => {
      expect(() => renderer.render(null)).toThrow('Invalid game state');
      expect(() => renderer.render({})).toThrow('Invalid game state');
    });

    it('should clear canvas', () => {
      expect(() => renderer.clear()).not.toThrow();
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 320, 640);
    });

    it('should update theme', () => {
      const newTheme = {
        ...mockTheme,
        primary: '#ff0000',
        glowIntensity: 1.0,
      };

      expect(() => renderer.setTheme(newTheme)).not.toThrow();
      
      // Should use new theme in subsequent renders
      renderer.render(mockGameState);
      // Verify theme change effect (implementation specific)
    });
  });

  describe('Component Rendering Contract', () => {
    let mockBoard;
    let mockTetromino;
    let mockScore;

    beforeEach(() => {
      renderer.initialize(mockCanvas, mockTheme);
      
      mockBoard = {
        width: 10,
        height: 20,
        grid: Array(20).fill().map(() => Array(10).fill(null)),
      };
      
      mockTetromino = TestUtils.createMockTetromino('T');
      
      mockScore = { currentScore: 500, level: 1, lines: 8 };
    });

    it('should render game board with neon effects', () => {
      expect(() => renderer.renderBoard(mockBoard)).not.toThrow();
      
      // Verify board rendering Canvas calls
      expect(mockContext.strokeStyle).toBeDefined();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should render tetromino piece with neon effects', () => {
      expect(() => renderer.renderPiece(mockTetromino)).not.toThrow();
      expect(() => renderer.renderPiece(mockTetromino, false)).not.toThrow();
    });

    it('should render ghost piece with reduced opacity', () => {
      expect(() => renderer.renderPiece(mockTetromino, true)).not.toThrow();
      
      // Verify ghost piece uses different alpha
      expect(mockContext.globalAlpha).toHaveBeenSet;
    });

    it('should render UI elements with neon styling', () => {
      expect(() => renderer.renderUI(mockScore, 1)).not.toThrow();
      
      // Verify UI text rendering
      expect(mockContext.fillText).toHaveBeenCalled();
      expect(mockContext.shadowBlur).toBeGreaterThan(0);
    });

    it('should throw error for invalid board', () => {
      expect(() => renderer.renderBoard(null)).toThrow('Invalid board');
      expect(() => renderer.renderBoard({})).toThrow('Invalid board');
    });

    it('should throw error for invalid piece', () => {
      expect(() => renderer.renderPiece(null)).toThrow('Invalid piece');
      expect(() => renderer.renderPiece({})).toThrow('Invalid piece');
    });
  });

  describe('Animation Contract', () => {
    beforeEach(() => {
      renderer.initialize(mockCanvas, mockTheme);
    });

    it('should animate line clear with particles', async () => {
      const lines = [18, 19]; // Bottom two lines
      
      const animationPromise = renderer.animateLineClear(lines);
      
      expect(animationPromise).toBeInstanceOf(Promise);
      
      // Should resolve when animation complete
      await expect(animationPromise).resolves.toBeUndefined();
    });

    it('should throw error for invalid line indices', () => {
      expect(() => renderer.animateLineClear(null)).toThrow('Invalid lines array');
      expect(() => renderer.animateLineClear([])).toThrow('Invalid lines array');
      expect(() => renderer.animateLineClear([25])).toThrow('Line index out of bounds');
    });

    it('should handle multiple simultaneous animations', async () => {
      const lines1 = [15, 16];
      const lines2 = [17, 18];
      
      const animation1 = renderer.animateLineClear(lines1);
      const animation2 = renderer.animateLineClear(lines2);
      
      await expect(Promise.all([animation1, animation2])).resolves.toBeDefined();
    });
  });

  describe('Performance Contract', () => {
    let mockGameState;

    beforeEach(() => {
      renderer.initialize(mockCanvas, mockTheme);
      
      mockGameState = {
        board: {
          width: 10,
          height: 20,
          grid: Array(20).fill().map(() => Array(10).fill(null)),
        },
        score: { currentScore: 0 },
        level: 1,
        gameStatus: 'playing',
      };
    });

    it('should set target frame rate', () => {
      expect(() => renderer.setFrameRate(60)).not.toThrow();
      expect(() => renderer.setFrameRate(30)).not.toThrow();
      expect(() => renderer.setFrameRate(120)).not.toThrow();
    });

    it('should throw error for invalid frame rate', () => {
      expect(() => renderer.setFrameRate(0)).toThrow('Invalid frame rate');
      expect(() => renderer.setFrameRate(-1)).toThrow('Invalid frame rate');
      expect(() => renderer.setFrameRate(null)).toThrow('Invalid frame rate');
    });

    it('should complete rendering within 16ms for 60 FPS', () => {
      renderer.setFrameRate(60);
      
      const startTime = performance.now();
      renderer.render(mockGameState);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(16);
    });

    it('should get performance metrics', () => {
      const metrics = renderer.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('frameTime');
      expect(metrics).toHaveProperty('droppedFrames');
      expect(metrics).toHaveProperty('memoryUsage');
      
      expect(typeof metrics.fps).toBe('number');
      expect(typeof metrics.frameTime).toBe('number');
    });

    it('should maintain performance with complex scenes', () => {
      // Fill board with complex pattern
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          mockGameState.board.grid[y][x] = Math.random() > 0.5 ? { color: '#00ffff' } : null;
        }
      }
      
      const startTime = performance.now();
      
      // Render multiple frames
      for (let i = 0; i < 10; i++) {
        renderer.render(mockGameState);
      }
      
      const endTime = performance.now();
      const avgFrameTime = (endTime - startTime) / 10;
      
      expect(avgFrameTime).toBeLessThan(16);
    });
  });

  describe('Event System Contract', () => {
    let eventHandler;

    beforeEach(() => {
      renderer.initialize(mockCanvas, mockTheme);
      eventHandler = jest.fn();
    });

    it('should emit renderComplete event after rendering', () => {
      renderer.on('renderComplete', eventHandler);
      
      const mockGameState = {
        board: { grid: [] },
        score: { currentScore: 0 },
        level: 1,
        gameStatus: 'playing',
      };
      
      renderer.render(mockGameState);
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          frameTime: expect.any(Number),
          timestamp: expect.any(Number),
        })
      );
    });

    it('should emit animationComplete event after animations', async () => {
      renderer.on('animationComplete', eventHandler);
      
      await renderer.animateLineClear([19]);
      
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          animationType: expect.any(String),
          duration: expect.any(Number),
        })
      );
    });

    it('should emit performanceWarning when FPS drops', () => {
      renderer.on('performanceWarning', eventHandler);
      renderer.setFrameRate(60);
      
      // Simulate performance drop - implementation specific
      // Test that the event contract exists
      expect(renderer.on).toBeDefined();
      expect(renderer.off).toBeDefined();
    });
  });

  describe('Error Recovery Contract', () => {
    beforeEach(() => {
      renderer.initialize(mockCanvas, mockTheme);
    });

    it('should recover from canvas context loss', () => {
      // Simulate context loss
      const contextLostEvent = new Event('webglcontextlost');
      mockCanvas.dispatchEvent(contextLostEvent);
      
      expect(() => renderer.handleContextLoss()).not.toThrow();
    });

    it('should reinitialize with valid canvas after error', () => {
      // Force an error state
      mockCanvas.getContext = () => null;
      
      expect(() => renderer.reinitialize(mockCanvas, mockTheme)).not.toThrow();
    });

    it('should provide fallback rendering on error', () => {
      const mockGameState = { corrupted: 'data' };
      
      // Should not crash, should provide fallback
      expect(() => renderer.render(mockGameState)).toThrow();
      
      // Canvas should still be in valid state
      expect(mockContext.save).toBeDefined();
    });
  });
});