/**
 * GameBoard - Represents the 10x20 game grid and manages placed pieces
 */
export class GameBoard {
  constructor(width = 10, height = 20) {
    this.width = width;
    this.height = height;
    this.grid = this.createEmptyGrid();
    this.activePiece = null;
    this.nextPiece = null;
    this.ghostPiece = null;
  }

  createEmptyGrid() {
    return Array(this.height).fill(null).map(() => Array(this.width).fill(null));
  }

  isValidPosition(piece, x, y, rotation = piece.rotation) {
    if (!piece || !piece.shape) return false;

    const shape = this.getRotatedShape(piece.shape, rotation);

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardX = x + col;
          const boardY = y + row;

          // Check boundaries
          if (boardX < 0 || boardX >= this.width || boardY >= this.height) {
            return false;
          }

          // Check collision with placed pieces (allow y < 0 for spawning)
          if (boardY >= 0 && this.grid[boardY][boardX] !== null) {
            return false;
          }
        }
      }
    }

    return true;
  }

  placePiece(piece) {
    if (!piece || !this.isValidPosition(piece, piece.position.x, piece.position.y)) {
      return false;
    }

    const shape = this.getRotatedShape(piece.shape, piece.rotation);

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardX = piece.position.x + col;
          const boardY = piece.position.y + row;

          if (boardY >= 0) {
            this.grid[boardY][boardX] = {
              type: piece.type,
              color: piece.color,
            };
          }
        }
      }
    }

    piece.locked = true;
    return true;
  }

  getCompletedLines() {
    const completedLines = [];

    for (let row = 0; row < this.height; row++) {
      if (this.grid[row].every(cell => cell !== null)) {
        completedLines.push(row);
      }
    }

    return completedLines;
  }

  clearLines(lineIndices) {
    // Sort in descending order to remove from bottom up
    const sortedLines = [...lineIndices].sort((a, b) => b - a);

    for (const lineIndex of sortedLines) {
      // Remove the completed line
      this.grid.splice(lineIndex, 1);
      // Add new empty line at top
      this.grid.unshift(Array(this.width).fill(null));
    }

    return sortedLines.length;
  }

  getDropPosition(piece) {
    if (!piece) return null;

    let dropY = piece.position.y;

    while (this.isValidPosition(piece, piece.position.x, dropY + 1)) {
      dropY++;
    }

    return { x: piece.position.x, y: dropY };
  }

  updateGhostPiece(piece) {
    if (!piece) {
      this.ghostPiece = null;
      return;
    }

    const dropPosition = this.getDropPosition(piece);
    if (dropPosition) {
      this.ghostPiece = {
        ...piece,
        position: dropPosition,
      };
    }
  }

  getRotatedShape(shape, rotation) {
    let rotatedShape = shape;

    for (let i = 0; i < rotation; i++) {
      rotatedShape = this.rotateMatrix90(rotatedShape);
    }

    return rotatedShape;
  }

  rotateMatrix90(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(false));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        rotated[col][rows - 1 - row] = matrix[row][col];
      }
    }

    return rotated;
  }

  isEmpty() {
    return this.grid.every(row => row.every(cell => cell === null));
  }

  isGameOver() {
    // Check if any pieces have locked above the visible board
    return this.grid[0].some(cell => cell !== null) ||
           this.grid[1].some(cell => cell !== null);
  }

  reset() {
    this.grid = this.createEmptyGrid();
    this.activePiece = null;
    this.nextPiece = null;
    this.ghostPiece = null;
  }

  clone() {
    const cloned = new GameBoard(this.width, this.height);
    cloned.grid = this.grid.map(row => [...row]);
    cloned.activePiece = this.activePiece;
    cloned.nextPiece = this.nextPiece;
    cloned.ghostPiece = this.ghostPiece;
    return cloned;
  }
}