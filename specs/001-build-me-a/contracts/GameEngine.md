# Game Engine Contract

**Interface**: GameEngine  
**Purpose**: Core game loop and state management
**Module**: `src/services/GameEngine.js`

## Methods

### `initialize(config: GameConfig): void`
**Description**: Initialize game engine with configuration
**Parameters**:
- `config`: GameConfig - Game settings and initial state
**Returns**: void
**Throws**: Error if configuration is invalid
**Preconditions**: Engine not already initialized
**Postconditions**: Game engine ready for start

### `start(): void`
**Description**: Begin game execution and start game loop
**Parameters**: None
**Returns**: void  
**Throws**: Error if not initialized or already running
**Preconditions**: Engine initialized, not currently running
**Postconditions**: Game loop active, pieces falling

### `pause(): void`
**Description**: Suspend game execution while preserving state
**Parameters**: None
**Returns**: void
**Throws**: Error if not currently running
**Preconditions**: Game currently running
**Postconditions**: Game loop paused, state preserved

### `resume(): void`  
**Description**: Resume game execution from paused state
**Parameters**: None
**Returns**: void
**Throws**: Error if not currently paused
**Preconditions**: Game currently paused
**Postconditions**: Game loop active, continues from pause point

### `reset(): void`
**Description**: Reset game to initial state
**Parameters**: None  
**Returns**: void
**Throws**: Never
**Preconditions**: None
**Postconditions**: All game state reset to defaults

### `update(deltaTime: number): GameState`
**Description**: Process one game loop iteration
**Parameters**:
- `deltaTime`: number - Time elapsed since last update (ms)
**Returns**: GameState - Updated game state
**Throws**: Error if engine not running
**Preconditions**: Game engine running
**Postconditions**: Game state advanced by deltaTime

### `handleInput(input: InputEvent): void`
**Description**: Process player input event
**Parameters**:
- `input`: InputEvent - Player input action
**Returns**: void
**Throws**: Error if invalid input type
**Preconditions**: Input event is valid
**Postconditions**: Game state updated based on input

### `getState(): GameState`
**Description**: Get current game state (read-only)
**Parameters**: None
**Returns**: GameState - Current game state
**Throws**: Never
**Preconditions**: None
**Postconditions**: None (read-only operation)

## Events

### `gameStateChanged`
**Description**: Fired when game state changes
**Payload**: `{ oldState: GameState, newState: GameState }`

### `scoreChanged` 
**Description**: Fired when score is updated
**Payload**: `{ score: number, level: number, lines: number }`

### `lineCleared`
**Description**: Fired when one or more lines are cleared
**Payload**: `{ linesCleared: number, isTetr is: boolean }`

### `gameOver`
**Description**: Fired when game ends
**Payload**: `{ finalScore: number, duration: number }`

### `levelUp`
**Description**: Fired when player advances to next level
**Payload**: `{ newLevel: number, requiredLines: number }`

## Error Conditions

### InvalidStateError
**When**: Method called in wrong game state
**Example**: Calling start() when already running
**Recovery**: Check state before method calls

### ConfigurationError  
**When**: Invalid configuration passed to initialize()
**Example**: Missing required settings, invalid values
**Recovery**: Provide valid configuration object

### InputError
**When**: Invalid input event processed
**Example**: Unknown key code, malformed event
**Recovery**: Validate input events before processing

## Performance Requirements

- `update()` must complete within 16ms (60 FPS requirement)
- Memory allocation during gameplay minimized
- Event emission should be O(1) complexity
- State reads should be O(1) complexity