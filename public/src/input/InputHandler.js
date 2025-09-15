/**
 * InputHandler - Keyboard input handling and event processing
 */
export class InputHandler extends EventTarget {
  constructor(gameSettings = null) {
    super();

    this.gameSettings = gameSettings;
    this.isEnabled = false;
    this.pressedKeys = new Set();
    this.keyRepeatTimers = new Map();
    this.lastKeyTime = new Map();

    // Auto-repeat settings
    this.autoRepeatDelay = 150; // Initial delay before repeat starts
    this.autoRepeatInterval = 50; // Repeat interval

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  enable() {
    if (this.isEnabled) return;

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.isEnabled = true;

    this.dispatchEvent(new CustomEvent('inputEnabled'));
  }

  disable() {
    if (!this.isEnabled) return;

    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this.clearAllRepeats();
    this.pressedKeys.clear();
    this.isEnabled = false;

    this.dispatchEvent(new CustomEvent('inputDisabled'));
  }

  handleKeyDown(event) {
    if (!this.isEnabled) return;

    const key = this.normalizeKey(event.code || event.key);

    // Prevent default behavior for game keys
    if (this.isGameKey(key)) {
      event.preventDefault();
    }

    // Check if key is already pressed (ignore repeats from OS)
    if (this.pressedKeys.has(key)) {
      return;
    }

    this.pressedKeys.add(key);
    this.lastKeyTime.set(key, performance.now());

    // Get game action for this key
    const action = this.getActionForKey(key);

    if (action) {
      this.dispatchInputEvent(action, key, 'keydown');

      // Set up auto-repeat for movement keys
      if (this.isMovementKey(action)) {
        this.setupAutoRepeat(key, action);
      }
    }
  }

  handleKeyUp(event) {
    if (!this.isEnabled) return;

    const key = this.normalizeKey(event.code || event.key);

    if (this.pressedKeys.has(key)) {
      this.pressedKeys.delete(key);
      this.clearKeyRepeat(key);

      const action = this.getActionForKey(key);
      if (action) {
        this.dispatchInputEvent(action, key, 'keyup');
      }
    }
  }

  handleVisibilityChange() {
    // Clear all inputs when tab loses focus
    if (document.hidden) {
      this.clearAllInputs();
    }
  }

  normalizeKey(key) {
    // Convert various key representations to standard format
    const keyMap = {
      ArrowLeft: 'ArrowLeft',
      ArrowRight: 'ArrowRight',
      ArrowUp: 'ArrowUp',
      ArrowDown: 'ArrowDown',
      Space: 'Space',
      ' ': 'Space',
      KeyZ: 'KeyZ',
      KeyX: 'KeyX',
      KeyP: 'KeyP',
      KeyR: 'KeyR',
      Escape: 'Escape',
    };

    return keyMap[key] || key;
  }

  isGameKey(key) {
    if (!this.gameSettings) {
      // Default game keys
      const defaultKeys = [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Space',
        'KeyZ',
        'KeyX',
        'KeyP',
        'KeyR',
        'Escape',
      ];
      return defaultKeys.includes(key);
    }

    return this.gameSettings.isControlKey(key);
  }

  getActionForKey(key) {
    if (!this.gameSettings) {
      // Default key mappings
      const defaultMappings = {
        ArrowLeft: 'moveLeft',
        ArrowRight: 'moveRight',
        ArrowUp: 'rotateRight',
        ArrowDown: 'softDrop',
        Space: 'hardDrop',
        KeyZ: 'rotateLeft',
        KeyX: 'rotateRight',
        KeyP: 'pause',
        KeyR: 'restart',
        Escape: 'pause',
      };
      return defaultMappings[key];
    }

    return this.gameSettings.getActionForKey(key);
  }

  isMovementKey(action) {
    return ['moveLeft', 'moveRight', 'softDrop'].includes(action);
  }

  setupAutoRepeat(key, action) {
    // Clear any existing repeat for this key
    this.clearKeyRepeat(key);

    const repeatTimer = setTimeout(() => {
      // Start repeating
      const intervalTimer = setInterval(() => {
        if (this.pressedKeys.has(key)) {
          this.dispatchInputEvent(action, key, 'repeat');
        } else {
          clearInterval(intervalTimer);
        }
      }, this.autoRepeatInterval);

      this.keyRepeatTimers.set(key, intervalTimer);
    }, this.autoRepeatDelay);

    this.keyRepeatTimers.set(key, repeatTimer);
  }

  clearKeyRepeat(key) {
    const timer = this.keyRepeatTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      this.keyRepeatTimers.delete(key);
    }
  }

  clearAllRepeats() {
    for (const timer of this.keyRepeatTimers.values()) {
      clearTimeout(timer);
      clearInterval(timer);
    }
    this.keyRepeatTimers.clear();
  }

  clearAllInputs() {
    this.pressedKeys.clear();
    this.clearAllRepeats();
    this.lastKeyTime.clear();
  }

  dispatchInputEvent(action, key, eventType) {
    const inputEvent = {
      action,
      key,
      type: eventType,
      timestamp: performance.now(),
    };

    this.dispatchEvent(
      new CustomEvent('input', {
        detail: inputEvent,
      })
    );
  }

  updateSettings(gameSettings) {
    this.gameSettings = gameSettings;

    if (gameSettings && gameSettings.gameplay) {
      this.autoRepeatDelay = gameSettings.gameplay.autoRepeat || 150;
      this.autoRepeatInterval = Math.max(30, this.autoRepeatDelay / 3);
    }
  }

  isKeyPressed(key) {
    return this.pressedKeys.has(this.normalizeKey(key));
  }

  isActionPressed(action) {
    if (!this.gameSettings) return false;

    const key = this.gameSettings.getKeyBinding(action);
    return key ? this.isKeyPressed(key) : false;
  }

  getPressedKeys() {
    return Array.from(this.pressedKeys);
  }

  getKeyPressTime(key) {
    return this.lastKeyTime.get(this.normalizeKey(key)) || 0;
  }

  // Debug and testing methods
  simulateKeyPress(key, action = null) {
    const normalizedKey = this.normalizeKey(key);
    const gameAction = action || this.getActionForKey(normalizedKey);

    if (gameAction) {
      this.dispatchInputEvent(gameAction, normalizedKey, 'simulated');
    }
  }

  getInputState() {
    return {
      isEnabled: this.isEnabled,
      pressedKeys: Array.from(this.pressedKeys),
      activeRepeats: Array.from(this.keyRepeatTimers.keys()),
      autoRepeatDelay: this.autoRepeatDelay,
      autoRepeatInterval: this.autoRepeatInterval,
    };
  }

  destroy() {
    this.disable();
    this.gameSettings = null;
  }
}
