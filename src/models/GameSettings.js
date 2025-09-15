/**
 * GameSettings - Player preferences and game configuration
 */
export class GameSettings {
  static DEFAULT_CONTROLS = {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    rotateLeft: 'KeyZ',
    rotateRight: 'ArrowUp',
    softDrop: 'ArrowDown',
    hardDrop: 'Space',
    pause: 'KeyP',
    restart: 'KeyR',
  };

  static DEFAULT_AUDIO = {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    musicEnabled: true,
    sfxEnabled: true,
  };

  static DEFAULT_VISUAL = {
    neonIntensity: 0.8,
    animationSpeed: 1.0,
    colorTheme: 'classic',
    showGhost: true,
    showGrid: true,
    particleEffects: true,
  };

  static DEFAULT_GAMEPLAY = {
    autoRepeat: 100,
    softDropSpeed: 20,
    lockDelay: 500,
  };

  static COLOR_THEMES = {
    classic: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      background: '#000011',
    },
    neon: {
      primary: '#00ff41',
      secondary: '#ff0080',
      accent: '#80ff00',
      background: '#001100',
    },
    cyberpunk: {
      primary: '#ff2a6d',
      secondary: '#05d9e8',
      accent: '#d1f7ff',
      background: '#120458',
    },
    retro: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#ffd23f',
      background: '#2d1b69',
    },
  };

  constructor(config = {}) {
    this.controls = { ...GameSettings.DEFAULT_CONTROLS, ...config.controls };
    this.audio = { ...GameSettings.DEFAULT_AUDIO, ...config.audio };
    this.visual = { ...GameSettings.DEFAULT_VISUAL, ...config.visual };
    this.gameplay = { ...GameSettings.DEFAULT_GAMEPLAY, ...config.gameplay };

    this.validateSettings();
  }

  validateSettings() {
    // Validate controls
    this.validateControls();

    // Validate audio settings
    this.validateAudio();

    // Validate visual settings
    this.validateVisual();

    // Validate gameplay settings
    this.validateGameplay();
  }

  validateControls() {
    const requiredKeys = Object.keys(GameSettings.DEFAULT_CONTROLS);
    for (const key of requiredKeys) {
      if (!this.controls[key]) {
        this.controls[key] = GameSettings.DEFAULT_CONTROLS[key];
      }
    }

    // Check for duplicate key bindings
    const usedKeys = Object.values(this.controls);
    const duplicates = usedKeys.filter((key, index) => usedKeys.indexOf(key) !== index);

    if (duplicates.length > 0) {
      console.warn('Duplicate key bindings detected:', duplicates);
    }
  }

  validateAudio() {
    this.audio.masterVolume = this.clamp(this.audio.masterVolume, 0, 1);
    this.audio.musicVolume = this.clamp(this.audio.musicVolume, 0, 1);
    this.audio.sfxVolume = this.clamp(this.audio.sfxVolume, 0, 1);
    this.audio.musicEnabled = Boolean(this.audio.musicEnabled);
    this.audio.sfxEnabled = Boolean(this.audio.sfxEnabled);
  }

  validateVisual() {
    this.visual.neonIntensity = this.clamp(this.visual.neonIntensity, 0, 1);
    this.visual.animationSpeed = this.clamp(this.visual.animationSpeed, 0.1, 3.0);
    this.visual.showGhost = Boolean(this.visual.showGhost);
    this.visual.showGrid = Boolean(this.visual.showGrid);
    this.visual.particleEffects = Boolean(this.visual.particleEffects);

    if (!GameSettings.COLOR_THEMES[this.visual.colorTheme]) {
      this.visual.colorTheme = 'classic';
    }
  }

  validateGameplay() {
    this.gameplay.autoRepeat = Math.max(50, this.gameplay.autoRepeat || 100);
    this.gameplay.softDropSpeed = this.clamp(this.gameplay.softDropSpeed, 10, 100);
    this.gameplay.lockDelay = Math.max(100, this.gameplay.lockDelay || 500);
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  updateControls(newControls) {
    this.controls = { ...this.controls, ...newControls };
    this.validateControls();
  }

  updateAudio(newAudio) {
    this.audio = { ...this.audio, ...newAudio };
    this.validateAudio();
  }

  updateVisual(newVisual) {
    this.visual = { ...this.visual, ...newVisual };
    this.validateVisual();
  }

  updateGameplay(newGameplay) {
    this.gameplay = { ...this.gameplay, ...newGameplay };
    this.validateGameplay();
  }

  getKeyBinding(action) {
    return this.controls[action];
  }

  setKeyBinding(action, key) {
    if (!GameSettings.DEFAULT_CONTROLS.hasOwnProperty(action)) {
      throw new Error(`Invalid action: ${action}`);
    }

    this.controls[action] = key;
    this.validateControls();
  }

  getCurrentTheme() {
    return GameSettings.COLOR_THEMES[this.visual.colorTheme];
  }

  setColorTheme(themeName) {
    if (!GameSettings.COLOR_THEMES[themeName]) {
      throw new Error(`Invalid color theme: ${themeName}`);
    }

    this.visual.colorTheme = themeName;
  }

  getAvailableThemes() {
    return Object.keys(GameSettings.COLOR_THEMES);
  }

  resetToDefaults() {
    this.controls = { ...GameSettings.DEFAULT_CONTROLS };
    this.audio = { ...GameSettings.DEFAULT_AUDIO };
    this.visual = { ...GameSettings.DEFAULT_VISUAL };
    this.gameplay = { ...GameSettings.DEFAULT_GAMEPLAY };
  }

  clone() {
    return new GameSettings({
      controls: { ...this.controls },
      audio: { ...this.audio },
      visual: { ...this.visual },
      gameplay: { ...this.gameplay },
    });
  }

  toJSON() {
    return {
      controls: { ...this.controls },
      audio: { ...this.audio },
      visual: { ...this.visual },
      gameplay: { ...this.gameplay },
    };
  }

  static fromJSON(data) {
    return new GameSettings(data);
  }

  equals(other) {
    if (!other) return false;

    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  // Get effective audio volumes (master volume applied)
  getEffectiveVolumes() {
    return {
      music: this.audio.musicVolume * this.audio.masterVolume,
      sfx: this.audio.sfxVolume * this.audio.masterVolume,
    };
  }

  // Check if a key matches any control
  isControlKey(key) {
    return Object.values(this.controls).includes(key);
  }

  // Get action for a specific key
  getActionForKey(key) {
    for (const [action, actionKey] of Object.entries(this.controls)) {
      if (actionKey === key) {
        return action;
      }
    }
    return null;
  }
}