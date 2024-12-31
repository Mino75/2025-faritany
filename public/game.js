
// public/game.js
const VERSION = "1.0.0";
const ROWS = 59;
const COLUMNS = 42;
const CELL_SIZE = 40;

const config = {
  type: Phaser.AUTO,
  width: COLUMNS * CELL_SIZE + 160,
  height: ROWS * CELL_SIZE,
  backgroundColor: '#ffffff',
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let graphics;
let gameState = {
  points: [],
  currentPath: [],
  currentPlayer: 'player1',
  playerNames: { player1: 'Mino', player2: 'Chen' },
  scores: { player1: 0, player2: 0 },
  hasPlacedPoint: false,
  lastCapturedPoint: null,
};

function preload() {
  console.log('Preloading assets...');
}

function create() {
  console.log('Creating the game scene...');
  graphics = this.add.graphics({ lineStyle: { width: 1, color: 0x000000 } });

  // Set global font style
  this.add.text(0, 0, '', { fontFamily: 'Montserrat' });

  // Draw the red line separator
  this.add.line(0, 0, 150, 0, 150, ROWS * CELL_SIZE, 0xff0000).setOrigin(0, 0);

  // Add player names and scores dynamically
  const player1Name = this.add.text(20, 50, `${gameState.playerNames.player1} (Blue)`, { fontSize: '20px', fill: '#0000ff', fontFamily: 'Montserrat' }).setInteractive();
  const player2Name = this.add.text(20, 150, `${gameState.playerNames.player2} (Red)`, { fontSize: '20px', fill: '#ff0000', fontFamily: 'Montserrat' }).setInteractive();

  player1Name.on('pointerdown', () => {
    const newName = prompt('Enter name for Player 1:', gameState.playerNames.player1);
    if (newName) {
      gameState.playerNames.player1 = newName;
      player1Name.setText(`${newName} (Blue)`);
    }
  });

  player2Name.on('pointerdown', () => {
    const newName = prompt('Enter name for Player 2:', gameState.playerNames.player2);
    if (newName) {
      gameState.playerNames.player2 = newName;
      player2Name.setText(`${newName} (Red)`);
    }
  });

  const restartButton = this.add.text(20, 250, '🔄 Restart', { fontSize: '20px', fill: '#000000', fontFamily: 'Montserrat', backgroundColor: '#f0f0f0' }).setInteractive();
  restartButton.on('pointerdown', () => {
    gameState = { points: [], currentPath: [], currentPlayer: 'player1', playerNames: gameState.playerNames, scores: { player1: 0, player2: 0 }, hasPlacedPoint: false, lastCapturedPoint: null };
    drawPoints(this);
    updateTurnIndicator(player1Name, player2Name);
    console.log('Game restarted');
  });

  const captureButton = this.add.text(20, 320, '🚩 Capture', { fontSize: '20px', fill: '#000000', fontFamily: 'Montserrat', backgroundColor: '#f0f0f0' }).setInteractive();
  captureButton.on('pointerdown', () => {
    if (gameState.points.length > 0) {
      const lastPoint = gameState.points[gameState.points.length - 1];
      if (lastPoint.player === gameState.currentPlayer) {
        console.log('Starting capture from last point:', lastPoint);

        // Mark the last point in yellow
        lastPoint.color = 0xffff00;
        gameState.lastCapturedPoint = lastPoint;
        drawPoints(this);

        gameState.currentPath = [lastPoint];
        gameState.hasPlacedPoint = false; // Allow drawing during capture
      } else {
        console.log('Cannot start capture: Last point does not belong to the current player.');
      }
    } else {
      console.log('No points placed yet to start capture.');
    }
  });

  const endTurnButton = this.add.text(20, 390, '⏭️ End Turn', { fontSize: '20px', fill: '#000000', fontFamily: 'Montserrat', backgroundColor: '#f0f0f0' }).setInteractive();
  endTurnButton.on('pointerdown', () => {
    console.log('Ending turn.');

    // Reset the color of the last captured point
    if (gameState.lastCapturedPoint) {
      gameState.lastCapturedPoint.color = gameState.currentPlayer === 'player1' ? 0x0000ff : 0xff0000;
      gameState.lastCapturedPoint = null;
      drawPoints(this);
    }

    gameState.currentPath = [];
    gameState.hasPlacedPoint = false;
    switchPlayer(player1Name, player2Name);
  });

  this.add.text(20, 460, `Version: ${VERSION}`, { fontSize: '14px', fill: '#000000', fontFamily: 'Montserrat' });

  updateTurnIndicator(player1Name, player2Name);

  console.log('Drawing grid...');
  drawGrid(this);

  this.input.on('pointerdown', (pointer) => {
    if (gameState.hasPlacedPoint) {
      console.log('You can only place one point per turn.');
      return;
    }

    const x = Math.round((pointer.x - 160) / CELL_SIZE) * CELL_SIZE + 160;
    const y = Math.round(pointer.y / CELL_SIZE) * CELL_SIZE;

    // Prevent placing points outside the grid
    if (x < 160 || x >= config.width || y < 0 || y >= config.height) {
      console.log('Point is outside of grid bounds, ignoring.');
      return;
    }

    console.log(`Pointer clicked at (${pointer.x}, ${pointer.y}), snapping to grid intersection (${x}, ${y})`);

    const newPoint = { x, y, player: gameState.currentPlayer };

    if (gameState.points.some((p) => p.x === x && p.y === y)) {
      console.log('Point already exists, ignoring.');
      return;
    }

    gameState.points.push(newPoint);
    gameState.hasPlacedPoint = true;
    drawPoints(this);
  });
}

function update() {}

function drawGrid(scene) {
  console.log('Drawing grid lines...');
  for (let x = 160; x <= COLUMNS * CELL_SIZE + 160; x += CELL_SIZE) {
    graphics.lineBetween(x, 0, x, ROWS * CELL_SIZE);
  }
  for (let y = 0; y <= ROWS * CELL_SIZE; y += CELL_SIZE) {
    graphics.lineBetween(160, y, COLUMNS * CELL_SIZE + 160, y);
  }
}

function drawPoints(scene) {
  console.log('Redrawing points and paths...');
  graphics.clear();
  drawGrid(scene);

  for (const point of gameState.points) {
    graphics.fillStyle(point.color || (point.player === 'player1' ? 0x0000ff : 0xff0000), 1);
    graphics.fillCircle(point.x, point.y, 5);
  }

  // Draw current path
  if (gameState.currentPath.length > 1) {
    graphics.lineStyle(2, gameState.currentPlayer === 'player1' ? 0x0000ff : 0xff0000);
    graphics.beginPath();
    for (let i = 0; i < gameState.currentPath.length - 1; i++) {
      const p1 = gameState.currentPath[i];
      const p2 = gameState.currentPath[i + 1];
      graphics.moveTo(p1.x, p1.y);
      graphics.lineTo(p2.x, p2.y);
    }
    graphics.strokePath();
  }
}

function updateTurnIndicator(player1Name, player2Name) {
  if (gameState.currentPlayer === 'player1') {
    player1Name.setStyle({ fontSize: '24px', fontWeight: 'bold' });
    player2Name.setStyle({ fontSize: '20px', fontWeight: 'normal' });
  } else {
    player2Name.setStyle({ fontSize: '24px', fontWeight: 'bold' });
    player1Name.setStyle({ fontSize: '20px', fontWeight: 'normal' });
  }
}

function switchPlayer(player1Name, player2Name) {
  gameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
  updateTurnIndicator(player1Name, player2Name);
}

function calculateScore() {
  if (gameState.currentPath.length < 3) return;

  const pathBounds = {
    minX: Math.min(...gameState.currentPath.map((p) => p.x)),
    maxX: Math.max(...gameState.currentPath.map((p) => p.x)),
    minY: Math.min(...gameState.currentPath.map((p) => p.y)),
    maxY: Math.max(...gameState.currentPath.map((p) => p.y)),
  };

  const enclosedPoints = gameState.points.filter((p) => {
    return (
      p.x > pathBounds.minX &&
      p.x < pathBounds.maxX &&
      p.y > pathBounds.minY &&
      p.y < pathBounds.maxY &&
      p.player !== gameState.currentPlayer
    );
  });

  gameState.scores[gameState.currentPlayer] += enclosedPoints.length;
  console.log(`${gameState.playerNames[gameState.currentPlayer]} scored ${enclosedPoints.length} points!`);
}
