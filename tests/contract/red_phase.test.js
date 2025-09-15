// GREEN Phase Test - Check implementations exist

import { GameEngine } from '../../src/services/GameEngine.js';
import { Renderer } from '../../src/rendering/Renderer.js';

describe('TDD GREEN Phase Validation', () => {
  test('GameEngine implementation exists', () => {
    expect(GameEngine).toBeDefined();
    expect(typeof GameEngine).toBe('function');

    const engine = new GameEngine();
    expect(engine).toBeInstanceOf(GameEngine);
    expect(typeof engine.initialize).toBe('function');
    expect(typeof engine.start).toBe('function');
    expect(typeof engine.pause).toBe('function');
    expect(typeof engine.reset).toBe('function');
  });

  test('Renderer implementation exists', () => {
    expect(Renderer).toBeDefined();
    expect(typeof Renderer).toBe('function');

    const renderer = new Renderer();
    expect(renderer).toBeInstanceOf(Renderer);
    expect(typeof renderer.initialize).toBe('function');
    expect(typeof renderer.render).toBe('function');
    expect(typeof renderer.clear).toBe('function');
  });

  test('InputHandler implementation exists', async () => {
    const { InputHandler } = await import('../../src/input/InputHandler.js');
    expect(InputHandler).toBeDefined();
    expect(typeof InputHandler).toBe('function');

    const inputHandler = new InputHandler();
    expect(inputHandler).toBeInstanceOf(InputHandler);
    expect(typeof inputHandler.enable).toBe('function');
    expect(typeof inputHandler.disable).toBe('function');
    expect(typeof inputHandler.handleKeyDown).toBe('function');
  });

  test('StorageManager implementation exists', async () => {
    const { StorageManager } = await import('../../src/storage/StorageManager.js');
    expect(StorageManager).toBeDefined();
    expect(typeof StorageManager).toBe('function');

    const storageManager = new StorageManager();
    expect(storageManager).toBeInstanceOf(StorageManager);
    expect(typeof storageManager.saveHighScores).toBe('function');
    expect(typeof storageManager.loadHighScores).toBe('function');
    expect(typeof storageManager.saveSettings).toBe('function');
    expect(typeof storageManager.loadSettings).toBe('function');
  });
});