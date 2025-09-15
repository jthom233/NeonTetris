// Jest setup for Tetris Game tests
// This file is run before each test file

// Mock Canvas API for tests
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));

global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => '');
global.HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
  left: 0,
  top: 0,
  width: 320,
  height: 640,
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock performance API
global.performance = global.performance || {};
global.performance.now = jest.fn(() => Date.now());

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock Web Audio API
global.AudioContext = jest.fn(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { value: 0 },
  })),
  destination: {},
  currentTime: 0,
}));

global.Audio = jest.fn(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Custom matchers for game testing
expect.extend({
  toBeWithinFPS(received, target = 60, tolerance = 5) {
    const pass = Math.abs(received - target) <= tolerance;
    return {
      message: () => 
        `expected ${received} FPS to be within ${tolerance} of target ${target} FPS`,
      pass,
    };
  },

  toBeValidGameState(received) {
    const required = ['board', 'score', 'level', 'gameStatus'];
    const pass = required.every(prop => Object.prototype.hasOwnProperty.call(received, prop));
    return {
      message: () => 
        `expected object to have required game state properties: ${required.join(', ')}`,
      pass,
    };
  },

  toBeValidTetromino(received) {
    const required = ['type', 'shape', 'position', 'rotation'];
    const pass = required.every(prop => Object.prototype.hasOwnProperty.call(received, prop));
    return {
      message: () => 
        `expected object to have required tetromino properties: ${required.join(', ')}`,
      pass,
    };
  },
});

// Test utilities
global.TestUtils = {
  // Create a mock game configuration
  createMockConfig: () => ({
    boardWidth: 10,
    boardHeight: 20,
    frameRate: 60,
    dropInterval: 1000,
  }),

  // Create a mock tetromino
  createMockTetromino: (type = 'I') => ({
    type,
    shape: [[1, 1, 1, 1]],
    position: { x: 5, y: 0 },
    rotation: 0,
    color: '#00ffff',
  }),

  // Wait for next animation frame
  waitForAnimationFrame: () => new Promise(resolve => {
    global.requestAnimationFrame(resolve);
  }),

  // Simulate time passing
  advanceTime: (ms) => {
    jest.advanceTimersByTime(ms);
  },
};