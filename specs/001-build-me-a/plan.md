# Implementation Plan: Modern Neon-Themed Tetris Game

**Branch**: `001-build-me-a` | **Date**: September 15, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-build-me-a/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✓
   → Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type: single (game application)
   → Set Structure Decision: Option 1 (single project)
3. Evaluate Constitution Check section below
   → Constitution is template only, proceeding with best practices
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → Generate research tasks for web technologies
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent file
6. Re-evaluate Constitution Check section
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Primary requirement: Single-player Tetris game with modern neon visual theme featuring classic gameplay mechanics (piece movement, rotation, line clearing), progressive difficulty, score tracking, and persistent high scores. Technical approach: Web-based game using HTML5 Canvas for rendering with modern CSS/JavaScript for neon effects and smooth animations.

## Technical Context
**Language/Version**: JavaScript ES2022, HTML5, CSS3  
**Primary Dependencies**: HTML5 Canvas API, Web Audio API (for sound effects), localStorage (for persistence)  
**Storage**: localStorage for high scores and game settings  
**Testing**: Jest for unit testing, Playwright for integration testing  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+)  
**Project Type**: single - web-based game application  
**Performance Goals**: 60 FPS rendering, <16ms frame time, smooth animations  
**Constraints**: Client-side only, no backend required, responsive design for desktop/tablet  
**Scale/Scope**: Single-player game, ~2000 lines of code, 5-10 game screens/states

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (game application only)
- Using framework directly? (vanilla JavaScript, no unnecessary wrappers)
- Single data model? (unified game state object)
- Avoiding patterns? (simple module pattern, no over-engineering)

**Architecture**:
- EVERY feature as library? (game modules: renderer, input, logic, storage)
- Libraries listed: 
  * GameEngine (core game loop and state management)
  * Renderer (Canvas-based neon graphics)
  * InputHandler (keyboard controls)
  * StorageManager (localStorage persistence)
- CLI per library: N/A (web application, browser-based interface)
- Library docs: README.md with usage examples

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (tests written first, fail, then implement)
- Git commits show tests before implementation? (commit structure enforced)
- Order: Contract→Integration→E2E→Unit strictly followed? (yes)
- Real dependencies used? (actual localStorage, Canvas API, not mocks)
- Integration tests for: game state transitions, rendering pipeline, input handling
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? (console logging with levels)
- Frontend logs → backend? (N/A, client-only application)
- Error context sufficient? (error boundaries and user feedback)

**Versioning**:
- Version number assigned? (1.0.0)
- BUILD increments on every change? (semantic versioning)
- Breaking changes handled? (backward compatibility for save data)

## Project Structure

### Documentation (this feature)
```
specs/001-build-me-a/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/              # Game entities (Tetromino, GameBoard, Score)
├── services/            # Game logic (GameEngine, LineDetector, ScoreCalculator)
├── rendering/           # Canvas rendering and neon effects
├── input/              # Keyboard input handling
└── storage/            # localStorage management

tests/
├── contract/           # API contract tests (internal module interfaces)
├── integration/        # Full game flow tests
└── unit/              # Individual component tests

public/
├── index.html          # Main game page
├── styles/             # CSS with neon theme
└── assets/             # Sounds, images
```

**Structure Decision**: Option 1 (single project) - web-based game application

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - HTML5 Canvas performance optimization techniques
   - CSS neon effects and animations implementation
   - Web Audio API for game sound effects
   - localStorage best practices for game data persistence
   - JavaScript game loop patterns for 60 FPS performance

2. **Generate and dispatch research agents**:
   ```
   Task: "Research HTML5 Canvas optimization for 60 FPS game rendering"
   Task: "Find CSS techniques for neon glow effects and smooth animations"
   Task: "Research Web Audio API integration for Tetris sound effects"
   Task: "Find localStorage patterns for game state persistence"
   Task: "Research JavaScript requestAnimationFrame game loop patterns"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]  
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technology decisions documented

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - GameBoard (10x20 grid, placed pieces)
   - Tetromino (shape, position, rotation, color)
   - GameState (current piece, next piece, score, level, lines cleared)
   - Score (points, level, lines cleared, high scores)
   - GameSettings (controls, sound, neon intensity)

2. **Generate API contracts** from functional requirements:
   - Game module interfaces (GameEngine, Renderer, InputHandler, StorageManager)
   - Event system contracts (piece movement, line clear, level up)
   - Data persistence contracts (save/load game state, high scores)
   - Output interface definitions to `/contracts/`

3. **Generate contract tests** from contracts:
   - GameEngine interface tests (start, pause, update, reset)
   - Renderer interface tests (render board, render piece, apply effects)
   - InputHandler interface tests (key binding, movement validation)
   - StorageManager interface tests (save/load operations)
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Game start → piece falling → player control → line clear → score update
   - Level progression → speed increase → game over → score persistence
   - Quickstart test = complete game flow validation

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/powershell/update-agent-context.ps1 -AgentType copilot` for GitHub Copilot
   - Add web game development context
   - Include neon theming and Canvas rendering guidance
   - Preserve existing content between markers

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models → Services → Rendering → Integration
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No constitutional violations identified. The project follows simplicity principles with a single web application, vanilla JavaScript approach, and modular library structure.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - research.md generated
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md, copilot-instructions.md generated
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS  
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*