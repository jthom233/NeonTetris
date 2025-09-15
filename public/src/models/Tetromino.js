/**
 * Tetromino - Represents game pieces with their shape, position, and state
 */
export class Tetromino {
  static SHAPES = {
    I: [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
    ],
    O: [
      [true, true],
      [true, true],
    ],
    T: [
      [false, true, false],
      [true, true, true],
      [false, false, false],
    ],
    S: [
      [false, true, true],
      [true, true, false],
      [false, false, false],
    ],
    Z: [
      [true, true, false],
      [false, true, true],
      [false, false, false],
    ],
    J: [
      [true, false, false],
      [true, true, true],
      [false, false, false],
    ],
    L: [
      [false, false, true],
      [true, true, true],
      [false, false, false],
    ],
  };

  static COLORS = {
    I: '#00ffff', // Cyan
    O: '#ffff00', // Yellow
    T: '#ff00ff', // Magenta
    S: '#00ff00', // Green
    Z: '#ff0000', // Red
    J: '#0000ff', // Blue
    L: '#ff8000', // Orange
  };

  static TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

  constructor(type = null, position = { x: 0, y: 0 }) {
    if (!type) {
      type = this.getRandomType();
    }

    this.validateType(type);

    this.type = type;
    this.shape = Tetromino.SHAPES[type];
    this.position = { ...position };
    this.rotation = 0;
    this.color = Tetromino.COLORS[type];
    this.locked = false;
  }

  static getRandomType() {
    return Tetromino.TYPES[Math.floor(Math.random() * Tetromino.TYPES.length)];
  }

  validateType(type) {
    if (!Tetromino.TYPES.includes(type)) {
      throw new Error(`Invalid tetromino type: ${type}`);
    }
  }

  move(deltaX, deltaY) {
    this.position.x += deltaX;
    this.position.y += deltaY;
  }

  moveTo(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  rotate(direction = 1) {
    this.rotation = (this.rotation + direction + 4) % 4;
  }

  getRotatedShape(rotation = this.rotation) {
    let rotatedShape = this.shape;

    for (let i = 0; i < rotation; i++) {
      rotatedShape = this.rotateMatrix90(rotatedShape);
    }

    return rotatedShape;
  }

  rotateMatrix90(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array(cols)
      .fill(null)
      .map(() => Array(rows).fill(false));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        rotated[col][rows - 1 - row] = matrix[row][col];
      }
    }

    return rotated;
  }

  getBoundingBox() {
    const shape = this.getRotatedShape();
    let minX = shape[0].length;
    let maxX = -1;
    let minY = shape.length;
    let maxY = -1;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          minX = Math.min(minX, col);
          maxX = Math.max(maxX, col);
          minY = Math.min(minY, row);
          maxY = Math.max(maxY, row);
        }
      }
    }

    return {
      minX: minX === shape[0].length ? 0 : minX,
      maxX: maxX === -1 ? 0 : maxX,
      minY: minY === shape.length ? 0 : minY,
      maxY: maxY === -1 ? 0 : maxY,
      width: maxX === -1 ? 0 : maxX - minX + 1,
      height: maxY === -1 ? 0 : maxY - minY + 1,
    };
  }

  getAbsoluteBlocks() {
    const shape = this.getRotatedShape();
    const blocks = [];

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          blocks.push({
            x: this.position.x + col,
            y: this.position.y + row,
            color: this.color,
            type: this.type,
          });
        }
      }
    }

    return blocks;
  }

  canRotate(direction = 1) {
    const originalRotation = this.rotation;
    this.rotate(direction);
    const rotatedShape = this.getRotatedShape();
    this.rotation = originalRotation; // Restore original rotation

    // Basic boundary check - more sophisticated collision detection
    // should be handled by GameBoard.isValidPosition()
    return rotatedShape.length > 0 && rotatedShape[0].length > 0;
  }

  reset() {
    this.position = { x: 0, y: 0 };
    this.rotation = 0;
    this.locked = false;
  }

  clone() {
    const cloned = new Tetromino(this.type, { ...this.position });
    cloned.rotation = this.rotation;
    cloned.locked = this.locked;
    return cloned;
  }

  equals(other) {
    return (
      other &&
      this.type === other.type &&
      this.position.x === other.position.x &&
      this.position.y === other.position.y &&
      this.rotation === other.rotation &&
      this.locked === other.locked
    );
  }

  static createRandomPiece(spawnX = 4, spawnY = 0) {
    return new Tetromino(Tetromino.getRandomType(), { x: spawnX, y: spawnY });
  }

  static createSpecificPiece(type, spawnX = 4, spawnY = 0) {
    return new Tetromino(type, { x: spawnX, y: spawnY });
  }
}
