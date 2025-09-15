# Tetris Game Constitution

## Core Principles

### I. Modular Design
Every feature must be implemented as a self-contained, independently testable module. Modules must have clear interfaces with single responsibility. No direct dependencies between game logic, rendering, input handling, or storage systems.

### II. Test-First Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. All commits must include failing tests before implementation code.

### III. Performance Requirements
Maintain 60 FPS rendering under normal gameplay. All frame updates must complete within 16ms. Memory allocation during gameplay minimized through object pooling. No frame drops during animations or line clears.

### IV. Browser Compatibility
Support modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Use vanilla JavaScript ES2022 with graceful feature detection. No framework dependencies that compromise performance or compatibility.

### V. Simplicity
Start simple, follow YAGNI principles. Avoid over-engineering patterns unless performance requires it. Direct implementations preferred over abstraction layers. Clear code over clever code.

## Development Standards

### Technology Stack
- **Frontend**: Vanilla JavaScript ES2022, HTML5 Canvas, CSS3
- **Testing**: Jest (unit), Playwright (integration), custom performance benchmarks
- **Build**: ES modules, no bundler complexity unless required
- **Storage**: localStorage only, no external dependencies

### Code Quality
- All functions under 50 lines unless rendering/math requires more
- Clear naming conventions: verbs for functions, nouns for classes
- Comprehensive error handling with user-friendly messages
- Console logging with structured format for debugging

## Quality Gates

### Pre-Implementation
- Feature specification approved and complete
- Interface contracts defined and validated
- Test scenarios written and failing
- Performance impact assessed

### Implementation
- All tests passing before code review
- Performance benchmarks maintained
- Browser compatibility verified
- Documentation updated

### Deployment
- Full test suite passing
- Performance validation complete
- Cross-browser testing passed
- User acceptance criteria met

## Governance

This constitution supersedes all other development practices. All code reviews must verify compliance with these principles. Any deviations must be justified and documented. 

Performance requirements are non-negotiable - if feature implementation cannot maintain 60 FPS, the approach must be reconsidered.

Use `.github/copilot-instructions.md` for runtime development guidance and patterns.

**Version**: 1.0.0 | **Ratified**: September 15, 2025 | **Last Amended**: September 15, 2025