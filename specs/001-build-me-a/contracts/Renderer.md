# Renderer Contract

**Interface**: Renderer  
**Purpose**: Canvas-based neon graphics rendering
**Module**: `src/rendering/Renderer.js`

## Methods

### `initialize(canvas: HTMLCanvasElement, theme: NeonTheme): void`
**Description**: Initialize renderer with canvas and theme
**Parameters**:
- `canvas`: HTMLCanvasElement - Target canvas for rendering
- `theme`: NeonTheme - Neon color scheme and visual settings
**Returns**: void
**Throws**: Error if canvas is invalid or theme malformed
**Preconditions**: Valid canvas element provided
**Postconditions**: Renderer ready for draw operations

### `render(gameState: GameState): void`  
**Description**: Render complete game state to canvas
**Parameters**:
- `gameState`: GameState - Current game state to render
**Returns**: void
**Throws**: Error if not initialized or invalid state
**Preconditions**: Renderer initialized, valid game state
**Postconditions**: Canvas displays current game state

### `clear(): void`
**Description**: Clear canvas for next frame
**Parameters**: None
**Returns**: void
**Throws**: Error if not initialized
**Preconditions**: Renderer initialized
**Postconditions**: Canvas cleared to background color

### `setTheme(theme: NeonTheme): void`
**Description**: Update neon color theme
**Parameters**:
- `theme`: NeonTheme - New color scheme to apply
**Returns**: void
**Throws**: Error if theme is invalid
**Preconditions**: Valid theme object
**Postconditions**: Future renders use new theme

### `renderBoard(board: GameBoard): void`
**Description**: Render game board grid and placed pieces
**Parameters**:
- `board`: GameBoard - Board state to render
**Returns**: void
**Throws**: Error if board is invalid
**Preconditions**: Valid board object
**Postconditions**: Board rendered with neon effects

### `renderPiece(piece: Tetromino, isGhost: boolean = false): void`
**Description**: Render tetromino piece with neon effects
**Parameters**:
- `piece`: Tetromino - Piece to render
- `isGhost`: boolean - Whether to render as ghost piece (optional)
**Returns**: void
**Throws**: Error if piece is invalid
**Preconditions**: Valid tetromino object
**Postconditions**: Piece rendered with appropriate opacity/effects

### `renderUI(score: Score, level: number): void`
**Description**: Render game UI elements (score, level, next piece)
**Parameters**:
- `score`: Score - Score information to display
- `level`: number - Current level to display
**Returns**: void
**Throws**: Error if parameters are invalid
**Preconditions**: Valid score and level data
**Postconditions**: UI elements rendered with neon styling

### `animateLineClear(lines: number[]): Promise<void>`
**Description**: Animate line clearing with particle effects
**Parameters**:
- `lines`: number[] - Array of line indices being cleared
**Returns**: Promise<void> - Resolves when animation complete
**Throws**: Error if lines array is invalid
**Preconditions**: Valid line indices
**Postconditions**: Clear animation played, promise resolved

## Performance Methods

### `setFrameRate(fps: number): void`
**Description**: Set target frame rate for rendering
**Parameters**:
- `fps`: number - Target frames per second (30, 60, 120)
**Returns**: void
**Throws**: Error if fps is invalid
**Preconditions**: FPS must be positive number
**Postconditions**: Rendering optimized for target frame rate

### `getPerformanceMetrics(): RenderMetrics`
**Description**: Get current rendering performance data
**Parameters**: None
**Returns**: RenderMetrics - Frame timing and performance data
**Throws**: Never
**Preconditions**: None
**Postconditions**: None (read-only operation)

## Configuration Types

### `NeonTheme`
```javascript
{
  primary: string,      // Primary neon color (hex)
  secondary: string,    // Secondary neon color (hex)  
  accent: string,       // Accent color for highlights (hex)
  background: string,   // Background color (hex)
  glowIntensity: number, // Glow effect strength (0-1)
  pulseSpeed: number    // Pulse animation speed (0-1)
}
```

### `RenderMetrics`
```javascript
{
  fps: number,          // Current frames per second
  frameTime: number,    // Average frame time (ms)
  droppedFrames: number, // Frames dropped in last second
  memoryUsage: number   // Approximate memory usage (MB)
}
```

## Events

### `renderComplete`
**Description**: Fired when frame rendering is complete
**Payload**: `{ frameTime: number, timestamp: number }`

### `animationComplete`
**Description**: Fired when line clear animation finishes
**Payload**: `{ animationType: string, duration: number }`

### `performanceWarning`
**Description**: Fired when performance drops below target
**Payload**: `{ currentFPS: number, targetFPS: number }`

## Error Conditions

### CanvasError
**When**: Canvas operations fail
**Example**: Context lost, invalid canvas element
**Recovery**: Reinitialize with valid canvas

### ThemeError
**When**: Invalid theme configuration
**Example**: Malformed colors, invalid intensity values
**Recovery**: Provide valid theme object or use defaults

### RenderError
**When**: Rendering operation fails
**Example**: Invalid game state, corrupted data
**Recovery**: Skip frame and log error

## Performance Requirements

- Maintain 60 FPS on modern hardware
- Frame rendering must complete within 16ms
- Memory allocation during render minimized
- Canvas operations batched for efficiency
- Neon effects optimized using CSS transforms where possible