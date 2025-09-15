/**
 * InputHandler Contract Test
 * Tests the InputHandler interface contract for keyboard controls
 * 
 * CRITICAL: This test MUST fail initially (RED phase of TDD)
 * Implementation should only be created after this test fails
 */

import { InputHandler } from '../../src/input/InputHandler.js';

describe('InputHandler Contract', () => {
  let inputHandler;
  let mockEventTarget;
  let mockGameEngine;

  beforeEach(() => {
    mockEventTarget = document.createElement('div');
    
    mockGameEngine = {
      handleInput: jest.fn(),
      isRunning: jest.fn(() => true),
      isPaused: jest.fn(() => false),
    };

    inputHandler = new InputHandler();
  });

  afterEach(() => {
    if (inputHandler && inputHandler.destroy) {
      inputHandler.destroy();
    }
  });

  describe('Initialization Contract', () => {
    it('should create InputHandler instance', () => {
      expect(inputHandler).toBeInstanceOf(InputHandler);
      expect(inputHandler).toBeDefined();
    });

    it('should initialize with target element and game engine', () => {
      expect(() => inputHandler.initialize(mockEventTarget, mockGameEngine)).not.toThrow();
      expect(inputHandler.isInitialized()).toBe(true);
    });

    it('should throw error for invalid target element', () => {
      expect(() => inputHandler.initialize(null, mockGameEngine)).toThrow('Invalid target element');
      expect(() => inputHandler.initialize({}, mockGameEngine)).toThrow('Invalid target element');
    });

    it('should throw error for invalid game engine', () => {
      expect(() => inputHandler.initialize(mockEventTarget, null)).toThrow('Invalid game engine');
      expect(() => inputHandler.initialize(mockEventTarget, {})).toThrow('Invalid game engine');
    });
  });

  describe('Keyboard Input Contract', () => {
    beforeEach(() => {
      inputHandler.initialize(mockEventTarget, mockGameEngine);
    });

    it('should handle left arrow key for piece movement', () => {
      const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'move',
          direction: 'left',
          originalEvent: keyEvent,
        })
      );
    });

    it('should handle right arrow key for piece movement', () => {
      const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowRight' });
      
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'move',
          direction: 'right',
          originalEvent: keyEvent,
        })
      );
    });

    it('should handle up arrow key for piece rotation', () => {
      const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowUp' });
      
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rotate',
          direction: 'clockwise',
          originalEvent: keyEvent,
        })
      );
    });

    it('should handle down arrow key for soft drop', () => {
      const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowDown' });
      
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'drop',
          mode: 'soft',
          originalEvent: keyEvent,
        })
      );
    });

    it('should handle space key for hard drop', () => {
      const keyEvent = new KeyboardEvent('keydown', { code: 'Space' });
      
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'drop',
          mode: 'hard',
          originalEvent: keyEvent,
        })
      );
    });

    it('should handle pause key (P)', () => {
      const keyEvent = new KeyboardEvent('keydown', { code: 'KeyP' });
      
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'game',
          action: 'pause',
          originalEvent: keyEvent,
        })
      );
    });
  });

  describe('Key Binding Contract', () => {
    beforeEach(() => {
      inputHandler.initialize(mockEventTarget, mockGameEngine);
    });

    it('should support custom key bindings', () => {
      const customBindings = {
        moveLeft: 'KeyA',
        moveRight: 'KeyD',
        rotate: 'KeyW',
        softDrop: 'KeyS',
        hardDrop: 'Enter',
        pause: 'Escape',
      };

      expect(() => inputHandler.setKeyBindings(customBindings)).not.toThrow();
      
      // Test custom binding works
      const keyEvent = new KeyboardEvent('keydown', { code: 'KeyA' });
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'move',
          direction: 'left',
        })
      );
    });

    it('should validate key bindings', () => {
      const invalidBindings = {
        moveLeft: null,
        moveRight: '',
      };

      expect(() => inputHandler.setKeyBindings(invalidBindings)).toThrow('Invalid key bindings');
    });

    it('should get current key bindings', () => {
      const bindings = inputHandler.getKeyBindings();
      
      expect(bindings).toHaveProperty('moveLeft');
      expect(bindings).toHaveProperty('moveRight');
      expect(bindings).toHaveProperty('rotate');
      expect(bindings).toHaveProperty('softDrop');
      expect(bindings).toHaveProperty('hardDrop');
      expect(bindings).toHaveProperty('pause');
    });
  });

  describe('Input State Management Contract', () => {
    beforeEach(() => {
      inputHandler.initialize(mockEventTarget, mockGameEngine);
    });

    it('should track key press and release states', () => {
      const keyDownEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      const keyUpEvent = new KeyboardEvent('keyup', { code: 'ArrowLeft' });
      
      mockEventTarget.dispatchEvent(keyDownEvent);
      expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(true);
      
      mockEventTarget.dispatchEvent(keyUpEvent);
      expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(false);
    });

    it('should prevent key repeat when appropriate', () => {
      const keyEvent1 = new KeyboardEvent('keydown', { code: 'ArrowUp', repeat: false });
      const keyEvent2 = new KeyboardEvent('keydown', { code: 'ArrowUp', repeat: true });
      
      mockEventTarget.dispatchEvent(keyEvent1);
      mockEventTarget.dispatchEvent(keyEvent2);
      
      // Rotation should only happen once (no repeat)
      expect(mockGameEngine.handleInput).toHaveBeenCalledTimes(1);
    });

    it('should allow key repeat for movement when configured', () => {
      inputHandler.setAutoRepeat(true, 150); // Enable auto-repeat with 150ms delay
      
      const keyEvent1 = new KeyboardEvent('keydown', { code: 'ArrowLeft', repeat: false });
      const keyEvent2 = new KeyboardEvent('keydown', { code: 'ArrowLeft', repeat: true });
      
      mockEventTarget.dispatchEvent(keyEvent1);
      mockEventTarget.dispatchEvent(keyEvent2);
      
      // Movement should allow repeat
      expect(mockGameEngine.handleInput).toHaveBeenCalledTimes(2);
    });
  });

  describe('Input Validation Contract', () => {
    beforeEach(() => {
      inputHandler.initialize(mockEventTarget, mockGameEngine);
    });

    it('should ignore input when game is not running', () => {
      mockGameEngine.isRunning.mockReturnValue(false);
      
      const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(mockGameEngine.handleInput).not.toHaveBeenCalled();
    });

    it('should handle input when game is paused only for pause/resume', () => {
      mockGameEngine.isPaused.mockReturnValue(true);
      
      const moveEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      const pauseEvent = new KeyboardEvent('keydown', { code: 'KeyP' });
      
      mockEventTarget.dispatchEvent(moveEvent);
      expect(mockGameEngine.handleInput).not.toHaveBeenCalled();
      
      mockEventTarget.dispatchEvent(pauseEvent);
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'game', action: 'pause' })
      );
    });

    it('should prevent default behavior for game keys', () => {
      const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      const preventDefaultSpy = jest.spyOn(keyEvent, 'preventDefault');
      
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not prevent default for non-game keys', () => {
      const keyEvent = new KeyboardEvent('keydown', { code: 'KeyF' });
      const preventDefaultSpy = jest.spyOn(keyEvent, 'preventDefault');
      
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Performance Contract', () => {
    beforeEach(() => {
      inputHandler.initialize(mockEventTarget, mockGameEngine);
    });

    it('should handle rapid input without lag', () => {
      const startTime = performance.now();
      
      // Simulate rapid key presses
      for (let i = 0; i < 100; i++) {
        const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
        mockEventTarget.dispatchEvent(keyEvent);
      }
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Should handle 100 inputs quickly
      expect(processingTime).toBeLessThan(50); // Less than 50ms for 100 inputs
    });

    it('should debounce rapid identical inputs', () => {
      inputHandler.setDebounceDelay(50); // 50ms debounce
      
      const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowUp' });
      
      // Rapid identical inputs within debounce window
      mockEventTarget.dispatchEvent(keyEvent);
      mockEventTarget.dispatchEvent(keyEvent);
      mockEventTarget.dispatchEvent(keyEvent);
      
      // Should only process first input
      expect(mockGameEngine.handleInput).toHaveBeenCalledTimes(1);
    });
  });

  describe('Touch Input Contract', () => {
    beforeEach(() => {
      inputHandler.initialize(mockEventTarget, mockGameEngine);
    });

    it('should support touch gestures for mobile', () => {
      inputHandler.enableTouchControls(true);
      
      // Simulate swipe left
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 50, clientY: 100 }],
      });
      
      mockEventTarget.dispatchEvent(touchStart);
      mockEventTarget.dispatchEvent(touchEnd);
      
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'move',
          direction: 'left',
        })
      );
    });

    it('should handle tap for rotation', () => {
      inputHandler.enableTouchControls(true);
      
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      });
      
      mockEventTarget.dispatchEvent(touchStart);
      setTimeout(() => {
        mockEventTarget.dispatchEvent(touchEnd);
      }, 100);
      
      // Short tap should trigger rotation
      expect(mockGameEngine.handleInput).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rotate',
        })
      );
    });
  });

  describe('Error Handling Contract', () => {
    it('should handle missing event properties gracefully', () => {
      inputHandler.initialize(mockEventTarget, mockGameEngine);
      
      // Malformed event
      const invalidEvent = { type: 'keydown' }; // Missing code property
      
      expect(() => {
        mockEventTarget.dispatchEvent(invalidEvent);
      }).not.toThrow();
    });

    it('should recover from event listener errors', () => {
      mockGameEngine.handleInput.mockImplementation(() => {
        throw new Error('Game engine error');
      });
      
      inputHandler.initialize(mockEventTarget, mockGameEngine);
      
      const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      
      // Should not crash input handler
      expect(() => {
        mockEventTarget.dispatchEvent(keyEvent);
      }).not.toThrow();
    });
  });

  describe('Cleanup Contract', () => {
    it('should remove event listeners on destroy', () => {
      inputHandler.initialize(mockEventTarget, mockGameEngine);
      
      const addEventListenerSpy = jest.spyOn(mockEventTarget, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(mockEventTarget, 'removeEventListener');
      
      inputHandler.destroy();
      
      // Should remove same number of listeners as added
      expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThan(0);
    });

    it('should clear internal state on destroy', () => {
      inputHandler.initialize(mockEventTarget, mockGameEngine);
      
      const keyEvent = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
      mockEventTarget.dispatchEvent(keyEvent);
      
      expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(true);
      
      inputHandler.destroy();
      
      expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(false);
      expect(inputHandler.isInitialized()).toBe(false);
    });
  });
});