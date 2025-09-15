# 🟩 Neon Tetris

A modern, neon-themed Tetris game built with vanilla JavaScript, HTML5 Canvas, and CSS3. Experience the classic puzzle game with stunning visual effects and smooth gameplay.

![Neon Tetris](https://img.shields.io/badge/Game-Tetris-neon?style=for-the-badge&logo=javascript&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ Features

- 🎮 **Classic Tetris Gameplay** - All seven standard tetrominoes (I, O, T, S, Z, J, L)
- 🌈 **Stunning Neon Theme** - Glowing effects and particle animations
- ⚡ **Smooth Performance** - 60 FPS gameplay with optimized rendering
- 🎯 **Progressive Difficulty** - Increasing speed and challenge levels
- 💾 **Score Persistence** - High scores saved between sessions
- ⌨️ **Responsive Controls** - Smooth keyboard input handling
- 🎵 **Visual Feedback** - Line clear effects and piece animations
- 📱 **Cross-Browser Support** - Works on Chrome 90+, Firefox 88+, Safari 14+

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ for development tooling
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jthom233/NeonTetris.git
   cd NeonTetris
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` and start playing!

## 🎮 How to Play

### Controls

- ⬅️ **Left Arrow** - Move piece left
- ➡️ **Right Arrow** - Move piece right
- ⬇️ **Down Arrow** - Soft drop (faster fall)
- ⬆️ **Up Arrow / Z** - Rotate piece clockwise
- **X** - Rotate piece counterclockwise
- **Space** - Hard drop (instant fall)
- **P** - Pause/Resume game
- **R** - Restart game

### Objective

- Stack falling tetrominoes to create complete horizontal lines
- Complete lines disappear and award points
- Game speeds up as you progress through levels
- Prevent pieces from reaching the top of the board

### Scoring

- **Single Line** - 100 × level points
- **Double Lines** - 300 × level points
- **Triple Lines** - 500 × level points
- **Tetris (4 lines)** - 800 × level points

## 🛠️ Development

### Project Structure

```
src/
├── models/              # Game entity classes
├── services/            # Game logic and engine
├── rendering/           # Canvas and neon effects
├── input/              # Keyboard handling
└── storage/            # localStorage management

tests/
├── contract/           # Interface validation
├── integration/        # Full game flows
└── unit/              # Component testing

public/
├── index.html          # Main game page
├── styles/             # Neon CSS theme
└── assets/             # Audio and visual assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run e2e` - Run end-to-end tests
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run format` - Format code with Prettier
- `npm run build` - Create production build
- `npm run perf-test` - Run performance benchmarks

### Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --grep "game initialization"
npm test -- --grep "basic gameplay"
npm test -- --grep "neon effects"

# Run end-to-end tests
npm run e2e
```

## 🎨 Technical Features

### Neon Visual Effects
- Glowing outlines on all game pieces
- Particle effects for line clearing
- Smooth movement animations with neon trails
- Dynamic color schemes and visual consistency

### Performance Optimizations
- Efficient canvas rendering
- RequestAnimationFrame-based game loop
- Memory leak prevention
- 60 FPS target with smooth animations

### Browser Compatibility
- ES2022 JavaScript features
- HTML5 Canvas API
- CSS3 animations and effects
- localStorage for persistence

## 🏆 Game Features

### Core Mechanics
- ✅ Standard 10×20 Tetris grid
- ✅ Seven classic tetromino shapes
- ✅ Piece rotation and movement
- ✅ Line detection and clearing
- ✅ Automatic piece falling with timer
- ✅ Level progression system
- ✅ Score calculation and display

### Visual & Audio
- ✅ Neon glow effects on all elements
- ✅ Smooth piece movement animations
- ✅ Particle effects for line clearing
- ✅ Next piece preview
- ✅ Responsive UI design

### Game States
- ✅ Start screen with instructions
- ✅ Active gameplay state
- ✅ Pause/resume functionality
- ✅ Game over detection
- ✅ High score persistence

## 📈 Performance Targets

- **Frame Rate**: Consistent 60 FPS
- **Memory Usage**: Under 100MB
- **Load Time**: Under 2 seconds
- **Input Lag**: Under 16ms response

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the classic Tetris game by Alexey Pajitnov
- Neon visual effects inspired by cyberpunk aesthetics
- Built with modern web technologies for optimal performance

---

**Enjoy playing Neon Tetris! 🎮✨**