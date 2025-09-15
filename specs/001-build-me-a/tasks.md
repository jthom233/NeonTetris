# Tasks: Modern Neon-Themed Tetris Game

**Input**: Design documents from `/specs/001-build-me-a/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Extract: JavaScript ES2022, HTML5 Canvas, CSS3, Web Audio API
   → Structure: Single project with src/, tests/, public/
2. Load optional design documents ✓:
   → data-model.md: Extract 6 entities → model tasks
   → contracts/: GameEngine.md, Renderer.md → contract test tasks
   → research.md: Extract tech decisions → setup tasks
   → quickstart.md: Extract test scenarios → integration tests
3. Generate tasks by category ✓:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, rendering
   → Integration: audio, storage, input handling
   → Polish: unit tests, performance, docs
4. Apply task rules ✓:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓:
   → All contracts have tests? ✓
   → All entities have models? ✓
   → All game flows implemented? ✓
9. Return: SUCCESS (tasks ready for execution) ✓
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root per plan.md
- JavaScript ES2022 modules with .js extensions
- HTML5 Canvas rendering and CSS3 neon effects

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan (src/, tests/, public/ directories)
- [ ] T002 Initialize JavaScript project with package.json, Jest, Playwright dependencies
- [ ] T003 [P] Configure ESLint and Prettier for JavaScript ES2022
- [ ] T004 [P] Create main HTML file in public/index.html with Canvas element
- [ ] T005 [P] Create base CSS file in public/styles/neon-theme.css with CSS custom properties

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T006 [P] Contract test GameEngine interface in tests/contract/test_game_engine.js
- [ ] T007 [P] Contract test Renderer interface in tests/contract/test_renderer.js
- [ ] T008 [P] Contract test InputHandler interface in tests/contract/test_input_handler.js
- [ ] T009 [P] Contract test StorageManager interface in tests/contract/test_storage_manager.js

### Integration Tests  
- [ ] T010 [P] Integration test game initialization in tests/integration/test_game_initialization.js
- [ ] T011 [P] Integration test basic gameplay flow in tests/integration/test_basic_gameplay.js
- [ ] T012 [P] Integration test neon visual effects in tests/integration/test_visual_effects.js
- [ ] T013 [P] Integration test level progression in tests/integration/test_level_progression.js
- [ ] T014 [P] Integration test game over and persistence in tests/integration/test_game_over.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Models (Parallel - Different Files)
- [ ] T015 [P] GameBoard model in src/models/GameBoard.js
- [ ] T016 [P] Tetromino model in src/models/Tetromino.js  
- [ ] T017 [P] GameState model in src/models/GameState.js
- [ ] T018 [P] Score model in src/models/Score.js
- [ ] T019 [P] HighScore model in src/models/HighScore.js
- [ ] T020 [P] GameSettings model in src/models/GameSettings.js

### Core Services (Sequential - Dependencies)
- [ ] T021 GameEngine core loop and state management in src/services/GameEngine.js
- [ ] T022 ScoreCalculator service in src/services/ScoreCalculator.js  
- [ ] T023 LineDetector service for line clearing in src/services/LineDetector.js

### Rendering System
- [ ] T024 [P] Renderer base class in src/rendering/Renderer.js
- [ ] T025 [P] NeonEffects helper for CSS neon styling in src/rendering/NeonEffects.js
- [ ] T026 Canvas optimization utilities in src/rendering/CanvasUtils.js

## Phase 3.4: Integration

### Input and Audio
- [ ] T027 [P] InputHandler for keyboard controls in src/input/InputHandler.js
- [ ] T028 [P] AudioManager for Web Audio API in src/services/AudioManager.js
- [ ] T029 [P] StorageManager for localStorage persistence in src/storage/StorageManager.js

### Game Integration
- [ ] T030 Connect GameEngine to Renderer pipeline
- [ ] T031 Connect InputHandler to GameEngine events
- [ ] T032 Connect AudioManager to game state changes
- [ ] T033 Connect StorageManager to high score persistence

### Performance Optimization
- [ ] T034 Implement object pooling for Tetromino pieces
- [ ] T035 Optimize Canvas rendering with requestAnimationFrame
- [ ] T036 Add performance monitoring and 60 FPS validation

## Phase 3.5: Polish

### Additional Tests
- [ ] T037 [P] Unit tests for game logic in tests/unit/test_game_logic.js
- [ ] T038 [P] Unit tests for scoring system in tests/unit/test_scoring.js
- [ ] T039 [P] Performance tests for 60 FPS maintenance in tests/unit/test_performance.js

### Documentation and Refinement  
- [ ] T040 [P] Update README.md with setup and play instructions
- [ ] T041 [P] Add code documentation and JSDoc comments
- [ ] T042 Remove code duplication and optimize bundle size
- [ ] T043 Run complete quickstart.md validation scenarios

## Dependencies

### Phase Dependencies
- Setup (T001-T005) before Tests (T006-T014)
- Tests (T006-T014) before Models (T015-T020)  
- Models (T015-T020) before Services (T021-T023)
- Services (T021-T023) before Rendering (T024-T026)
- Core (T015-T026) before Integration (T027-T033)
- Integration (T027-T033) before Performance (T034-T036)
- Everything before Polish (T037-T043)

### Specific Dependencies
- T021 (GameEngine) requires T015-T020 (all models)
- T030 (Engine-Renderer) requires T021, T024
- T031 (Input-Engine) requires T027, T021
- T032 (Audio-Engine) requires T028, T021
- T034-T036 (Performance) require T021, T024

## Parallel Execution Examples

### Phase 3.1 Setup (Parallel)
```bash
# Launch T003-T005 together:
Task: "Configure ESLint and Prettier for JavaScript ES2022"
Task: "Create main HTML file in public/index.html with Canvas element"  
Task: "Create base CSS file in public/styles/neon-theme.css with CSS custom properties"
```

### Phase 3.2 Contract Tests (Parallel)
```bash  
# Launch T006-T009 together:
Task: "Contract test GameEngine interface in tests/contract/test_game_engine.js"
Task: "Contract test Renderer interface in tests/contract/test_renderer.js"
Task: "Contract test InputHandler interface in tests/contract/test_input_handler.js"
Task: "Contract test StorageManager interface in tests/contract/test_storage_manager.js"
```

### Phase 3.2 Integration Tests (Parallel)
```bash
# Launch T010-T014 together:
Task: "Integration test game initialization in tests/integration/test_game_initialization.js"
Task: "Integration test basic gameplay flow in tests/integration/test_basic_gameplay.js"  
Task: "Integration test neon visual effects in tests/integration/test_visual_effects.js"
Task: "Integration test level progression in tests/integration/test_level_progression.js"
Task: "Integration test game over and persistence in tests/integration/test_game_over.js"
```

### Phase 3.3 Models (Parallel)
```bash
# Launch T015-T020 together:
Task: "GameBoard model in src/models/GameBoard.js"
Task: "Tetromino model in src/models/Tetromino.js"
Task: "GameState model in src/models/GameState.js"  
Task: "Score model in src/models/Score.js"
Task: "HighScore model in src/models/HighScore.js"
Task: "GameSettings model in src/models/GameSettings.js"
```

### Phase 3.4 Integration Components (Parallel)
```bash
# Launch T027-T029 together:
Task: "InputHandler for keyboard controls in src/input/InputHandler.js"
Task: "AudioManager for Web Audio API in src/services/AudioManager.js"
Task: "StorageManager for localStorage persistence in src/storage/StorageManager.js"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (RED-GREEN-REFACTOR)
- Commit after each task or logical group
- Focus on 60 FPS performance throughout implementation
- Maintain neon theme consistency across all visual elements

## Task Generation Rules Applied

### From Contracts (GameEngine.md, Renderer.md):
- Each contract → contract test task [P] (T006-T009)
- Contract methods → implementation tasks (T021, T024)

### From Data Model (6 entities):  
- Each entity → model creation task [P] (T015-T020)
- Relationships → service layer tasks (T021-T023)

### From Quickstart Test Scenarios:
- Each test scenario → integration test [P] (T010-T014)
- Performance validation → performance tasks (T034-T036)

### From Plan.md Libraries:
- GameEngine → T021, T006
- Renderer → T024, T007  
- InputHandler → T027, T008
- StorageManager → T029, T009

## Validation Checklist
- [✓] All contracts have corresponding tests (T006-T009)
- [✓] All entities have model tasks (T015-T020)
- [✓] All tests come before implementation (TDD enforced)
- [✓] Parallel tasks truly independent (different files)  
- [✓] Each task specifies exact file path
- [✓] No task modifies same file as another [P] task
- [✓] 60 FPS performance requirements integrated throughout
- [✓] Neon theme requirements covered in rendering tasks