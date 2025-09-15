# Data Model: Modern Neon-Themed Tetris Game

**Date**: September 15, 2025  
**Feature**: Modern Neon-Themed Tetris Game  
**Phase**: 1 - Data Model Design

## Core Entities

### GameBoard
**Purpose**: Represents the 10x20 game grid and manages placed pieces

**Fields**:
- `width`: Number (10) - Board width in cells
- `height`: Number (20) - Board height in cells  
- `grid`: Array[Array[Cell]] - 2D array representing the game board
- `activePiece`: Tetromino | null - Currently falling piece
- `nextPiece`: Tetromino | null - Next piece to be placed
- `ghostPiece`: Tetromino | null - Preview of piece placement

**Validation Rules**:
- Grid must be exactly 10x20 dimensions
- Each cell must be either null (empty) or contain tetromino data
- Active piece position must be within board boundaries
- Ghost piece must show valid placement position

**State Transitions**:
- Empty → Active piece spawned
- Active piece → Locked piece (when piece lands)
- Full line → Cleared line (when horizontal line completed)

### Tetromino  
**Purpose**: Represents game pieces with their shape, position, and state

**Fields**:
- `type`: String - Piece type (I, O, T, S, Z, J, L)
- `shape`: Array[Array[Boolean]] - 2D array defining piece shape
- `position`: Position - Current x,y coordinates on board
- `rotation`: Number (0-3) - Current rotation state
- `color`: String - Neon color theme for rendering
- `locked`: Boolean - Whether piece is placed on board

**Validation Rules**:
- Type must be one of seven standard Tetris pieces
- Shape must match the defined pattern for the type
- Position must be valid board coordinates
- Rotation must be 0, 1, 2, or 3 (90-degree increments)
- Color must be valid neon theme color

**State Transitions**:
- Spawned → Falling → Placed → Locked
- Rotation: 0 → 1 → 2 → 3 → 0 (cyclical)

### GameState
**Purpose**: Central state container for all game data and status

**Fields**:
- `board`: GameBoard - The game board and pieces
- `score`: Score - Current scoring information  
- `level`: Number - Current difficulty level
- `linesCleared`: Number - Total lines cleared this session
- `gameStatus`: String - Current game state (playing, paused, gameOver, menu)
- `startTime`: Date - When current game session started
- `lastUpdate`: Date - Timestamp of last game update
- `settings`: GameSettings - Player preferences and configuration

**Validation Rules**:
- Level must be positive integer
- Lines cleared must be non-negative integer
- Game status must be valid state enum
- Timestamps must be valid Date objects

**State Transitions**:
- menu → playing (game start)
- playing → paused (player pause)
- paused → playing (resume)
- playing → gameOver (pieces reach top)
- gameOver → menu (restart)

### Score
**Purpose**: Tracks player performance and progression

**Fields**:
- `currentScore`: Number - Points earned this session
- `level`: Number - Current difficulty level
- `lines`: Number - Lines cleared this session
- `totalLines`: Number - Lifetime lines cleared
- `multiplier`: Number - Current score multiplier
- `lastLineClears`: Array[Number] - Recent line clear counts for combo detection

**Validation Rules**:
- All numeric values must be non-negative
- Level increases based on lines cleared (every 10 lines)
- Multiplier applies for multiple line clears (Tetris bonus)
- Score calculation follows standard Tetris scoring

**Relationships**:
- References GameState for level synchronization
- Used by HighScore for comparison and persistence

### HighScore
**Purpose**: Persistent record of best performances

**Fields**:
- `scores`: Array[ScoreEntry] - List of high scores
- `maxEntries`: Number (10) - Maximum scores to store
- `personalBest`: Number - Player's highest score
- `lastUpdated`: Date - When scores were last modified

**ScoreEntry Fields**:
- `score`: Number - Final score achieved
- `level`: Number - Level reached
- `lines`: Number - Lines cleared
- `date`: Date - When score was achieved
- `duration`: Number - Game session length in seconds

**Validation Rules**:
- Scores array sorted in descending order
- Maximum 10 entries maintained
- All score entries must have valid data
- Personal best must match highest entry score

### GameSettings
**Purpose**: Player preferences and game configuration

**Fields**:
- `controls`: ControlsConfig - Keyboard mappings
- `audio`: AudioConfig - Sound and music settings
- `visual`: VisualConfig - Neon theme and effects settings
- `gameplay`: GameplayConfig - Game behavior preferences

**ControlsConfig Fields**:
- `moveLeft`: String - Key for moving piece left
- `moveRight`: String - Key for moving piece right
- `rotateLeft`: String - Key for counter-clockwise rotation
- `rotateRight`: String - Key for clockwise rotation
- `softDrop`: String - Key for faster piece drop
- `hardDrop`: String - Key for instant piece drop
- `pause`: String - Key for game pause

**AudioConfig Fields**:
- `masterVolume`: Number (0-1) - Overall audio volume
- `musicVolume`: Number (0-1) - Background music volume
- `sfxVolume`: Number (0-1) - Sound effects volume
- `musicEnabled`: Boolean - Whether music plays
- `sfxEnabled`: Boolean - Whether sound effects play

**VisualConfig Fields**:
- `neonIntensity`: Number (0-1) - Glow effect intensity
- `animationSpeed`: Number (0-1) - Animation timing modifier
- `colorTheme`: String - Active neon color scheme
- `showGhost`: Boolean - Whether ghost piece is visible
- `showGrid`: Boolean - Whether grid lines are visible
- `particleEffects`: Boolean - Whether line clear particles show

**GameplayConfig Fields**:
- `autoRepeat`: Number - Key repeat delay in milliseconds
- `softDropSpeed`: Number - Soft drop speed multiplier
- `lockDelay`: Number - Piece lock delay in milliseconds

## Entity Relationships

### Primary Relationships
```
GameState (1) ←→ (1) GameBoard
GameState (1) ←→ (1) Score  
GameState (1) ←→ (1) GameSettings
GameBoard (1) ←→ (0..2) Tetromino (active, next)
Score (1) ←→ (1) HighScore
```

### Data Flow Relationships
```
Input Events → GameState → GameBoard → Tetromino Updates
GameBoard → Score Calculation → HighScore Update
GameState → Renderer → Visual Output
GameSettings → All Components (configuration)
```

## Persistence Schema

### localStorage Structure
```json
{
  "tetris_highscores": {
    "scores": [ScoreEntry],
    "personalBest": Number,
    "lastUpdated": String (ISO date)
  },
  "tetris_settings": {
    "controls": ControlsConfig,
    "audio": AudioConfig, 
    "visual": VisualConfig,
    "gameplay": GameplayConfig
  },
  "tetris_gamestate": {
    "hasActiveSave": Boolean,
    "board": GameBoard (if hasActiveSave),
    "score": Score (if hasActiveSave),
    "level": Number (if hasActiveSave),
    "timestamp": String (ISO date)
  }
}
```

### Data Migration Strategy
- Version field in each localStorage entry
- Backward compatibility for settings and high scores
- Graceful handling of corrupted or missing data
- Default values for all configuration options

## Validation and Constraints

### Performance Constraints
- Game state updates must complete within 16ms (60 FPS)
- Object creation minimized during gameplay (object pooling)
- JSON serialization for localStorage must be under 1MB total
- Board operations must be O(1) or O(n) where n ≤ 200 (board size)

### Business Rules
- Standard Tetris piece behavior and rotation systems
- Scoring follows classic Tetris point values
- Level progression based on lines cleared (10 lines per level)
- Game over when pieces exceed board height

### Data Integrity Rules
- All game state changes must be atomic
- Score calculations must be deterministic and reproducible
- High scores must be validated against possible maximums
- Settings changes must be immediately persisted

This data model provides a comprehensive foundation for implementing all functional requirements while maintaining clear separation of concerns and efficient data operations.