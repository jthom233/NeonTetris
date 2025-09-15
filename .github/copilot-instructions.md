# GitHub Copilot Instructions: Modern Neon-Themed Tetris Game

**Project**: Modern Neon-Themed Tetris Game  
**Branch**: 001-build-me-a  
**Tech Stack**: JavaScript ES2022, HTML5 Canvas, CSS3  
**Updated**: September 15, 2025

## Project Context

This is a single-player Tetris game with modern neon visual theming. The game uses vanilla JavaScript with HTML5 Canvas for rendering and CSS3 for neon effects. Focus on performance (60 FPS), clean modular architecture, and comprehensive testing.

### Key Technologies
- **Frontend**: JavaScript ES2022, HTML5 Canvas API, CSS3 custom properties
- **Audio**: Web Audio API for sound effects and music
- **Storage**: localStorage for high scores and settings persistence
- **Testing**: Jest (unit), Playwright (E2E), custom performance tests
- **Build**: Modern ES modules, no frameworks

### Architecture Principles
- Component-based modular design (GameEngine, Renderer, InputHandler, StorageManager)
- Test-driven development (TDD) with RED-GREEN-REFACTOR cycle
- Performance-first approach (requestAnimationFrame, object pooling)
- Clean interfaces with comprehensive error handling

## Code Patterns and Guidelines

### Module Structure
```javascript
// Use modern ES module exports
export class GameEngine {
  constructor(config) { /* ... */ }
  start() { /* ... */ }
  pause() { /* ... */ }
  update(deltaTime) { /* ... */ }
}

// Import patterns
import { GameEngine } from './services/GameEngine.js';
import { Renderer } from './rendering/Renderer.js';
```

### Performance Patterns
```javascript
// Use requestAnimationFrame for smooth 60 FPS
class GameLoop {
  start() {
    let lastTime = 0;
    const gameLoop = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      this.update(deltaTime);
      this.render();
      
      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }
}

// Object pooling for pieces
class TetrominoPool {
  constructor() {
    this.pool = [];
    this.available = [];
  }
  
  acquire() {
    return this.available.pop() || new Tetromino();
  }
  
  release(tetromino) {
    tetromino.reset();
    this.available.push(tetromino);
  }
}
```

### Neon Effect Patterns
```css
/* Use CSS custom properties for theme management */
:root {
  --neon-primary: #00ffff;
  --neon-secondary: #ff00ff;  
  --neon-glow: 0 0 10px var(--neon-primary), 0 0 20px var(--neon-primary);
}

.neon-element {
  color: var(--neon-primary);
  text-shadow: var(--neon-glow);
  box-shadow: var(--neon-glow);
  transition: all 0.3s ease;
}

/* Hardware acceleration for animations */
.animated {
  transform: translateZ(0);
  will-change: transform, opacity;
}
```

### Testing Patterns
```javascript
// Contract tests for interfaces
describe('GameEngine Contract', () => {
  let engine;
  
  beforeEach(() => {
    engine = new GameEngine(mockConfig);
  });
  
  it('should start game when initialized', () => {
    expect(() => engine.start()).not.toThrow();
    expect(engine.isRunning()).toBe(true);
  });
  
  it('should update game state with delta time', () => {
    engine.start();
    const oldState = engine.getState();
    engine.update(16); // 60 FPS frame
    const newState = engine.getState();
    expect(newState.timestamp).toBeGreaterThan(oldState.timestamp);
  });
});

// Integration tests for game flows
describe('Complete Game Flow', () => {
  it('should play full game session', async () => {
    await gameSession.start();
    await gameSession.placePieces(5);
    await gameSession.completeLine();
    expect(gameSession.getScore()).toBeGreaterThan(0);
  });
});
```

## Recent Changes
- 001-build-me-a: Added JavaScript game engine with Canvas rendering and neon CSS theming

## Specific Guidance

### When implementing game logic:
- Follow the data model defined in `specs/001-build-me-a/data-model.md`
- Use the interfaces defined in `specs/001-build-me-a/contracts/`
- Prioritize performance - all updates must complete within 16ms
- Implement comprehensive error handling for all user inputs

### When creating visual effects:
- Use CSS custom properties for themeable neon colors
- Layer multiple box-shadows for authentic glow effects
- Leverage CSS transforms for hardware acceleration
- Batch Canvas operations to minimize state changes

### When writing tests:
- Always write tests before implementation (TDD)
- Test contracts/interfaces first, then integration scenarios
- Include performance tests for critical paths (game loop, rendering)
- Mock time-dependent operations with controllable test clocks

### When handling user input:
- Debounce rapid key presses to prevent lag
- Provide immediate visual feedback for all actions
- Support both keyboard and touch inputs where applicable
- Validate all inputs before processing

### File Organization:
- Place models in `src/models/` (GameBoard.js, Tetromino.js, Score.js)
- Place services in `src/services/` (GameEngine.js, ScoreCalculator.js)
- Place rendering code in `src/rendering/` (Renderer.js, NeonEffects.js)
- Place utilities in `src/utils/` (helpers, constants, enums)

### Error Handling:
- Use custom error classes for different error types
- Log errors with context (game state, user action, timestamp)
- Provide user-friendly error messages with recovery suggestions
- Never let errors crash the game loop

## Performance Targets
- Maintain 60 FPS rendering under normal gameplay
- Keep frame time under 16ms average
- Memory usage under 100MB total
- Game startup under 2 seconds on modern browsers
- Smooth animations without frame drops during line clears

Remember: This is a performance-critical real-time application. Always consider the impact on frame rate when adding new features or effects.