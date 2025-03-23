
// ----------------------------
// Service Worker Registration
// ----------------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(() => {
    console.log('Service Worker Registered');
  });
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.action === 'reload') {
      console.log('New version available. Reloading...');
      window.location.reload();
    }
  });
}

// Board configuration
const COLS = 22;  // 22 columns
const ROWS = 38;  // 38 rows
let CELL_SIZE = 30; // Default cell size (will be recalculated)

// Get DOM elements
const canvas = document.getElementById("plateau");
const ctx = canvas.getContext("2d");
const gameArea = document.getElementById("game-area");

// Function to update canvas size based on available game area width
function updateCanvasSize() {
  const availableWidth = gameArea.clientWidth;
  CELL_SIZE = availableWidth / COLS;
  canvas.width = availableWidth;
  canvas.height = ROWS * CELL_SIZE;
}
updateCanvasSize();

// Create the board as a 2D array.
// Each cell is either null or an object representing a point:
// { color: "blue" or "red", active: true/false }.
// A point becomes inactive (disabled) once it is encircled.
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

// Player information
const players = {
  blue: { name: "Mino", color: "blue" },
  red: { name: "Chen", color: "red" }
};

// Scores for each player
const scores = { blue: 0, red: 0 };

// The current player (blue starts)
let currentPlayer = "blue";

// Array to store drawn encirclement borders (each is an array of [i,j] points)
const encirclements = [];

// ----------------------
// Drawing functions
// ----------------------

// Draw the grid, points, and encirclement borders on the canvas
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  ctx.strokeStyle = "#555";
  for (let i = 0; i < COLS; i++) {
    const x = i * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j < ROWS; j++) {
    const y = j * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw points (using a radius of 1/6 of cell size)
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const point = board[j][i];
      if (point) {
        ctx.beginPath();
        ctx.arc(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE / 6, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        // If the point is inactive (encircled), draw it with a darker shade (or add an outline)
        ctx.globalAlpha = point.active ? 1.0 : 0.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }
  }

  // Draw encirclement borders
  encirclements.forEach(borderPoints => {
    if (borderPoints.length > 0) {
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "white";
      const [firstX, firstY] = borderPoints[0];
      ctx.moveTo(firstX * CELL_SIZE, firstY * CELL_SIZE);
      for (let k = 1; k < borderPoints.length; k++) {
        const [x, y] = borderPoints[k];
        ctx.lineTo(x * CELL_SIZE, y * CELL_SIZE);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  });

  // Update the sidebar with score and current player info
  document.getElementById("score").textContent =
    `Score – ${players.blue.name} (Blue): ${scores.blue}\n` +
    `${players.red.name} (Red): ${scores.red}\n` +
    `Current Player: ${players[currentPlayer].name} (${currentPlayer})`;
}

// ----------------------
// Mouse interaction
// ----------------------

// Get the nearest intersection from a click if within threshold
function getIntersection(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const i = Math.round(x / CELL_SIZE);
  const j = Math.round(y / CELL_SIZE);
  // Compute the center of the nearest intersection
  const centerX = i * CELL_SIZE;
  const centerY = j * CELL_SIZE;
  // Define a threshold (40% of CELL_SIZE)
  const threshold = CELL_SIZE * 0.4;
  const dx = x - centerX;
  const dy = y - centerY;
  if (Math.sqrt(dx * dx + dy * dy) <= threshold) {
    return { i, j };
  }
  return null;
}

// Check that (i, j) is within board bounds
function inBounds(i, j) {
  return i >= 0 && i < COLS && j >= 0 && j < ROWS;
}

// Handle canvas click events
canvas.addEventListener("click", (event) => {
  const intersection = getIntersection(event);
  if (!intersection) return;
  const { i, j } = intersection;
  if (!inBounds(i, j)) return;
  // Place a point only if the intersection is empty
  if (board[j][i] === null) {
    board[j][i] = { color: currentPlayer, active: true };
    // Check for encirclements around the newly placed point
    detectEncirclements(i, j);
    // Switch current player automatically
    currentPlayer = currentPlayer === "blue" ? "red" : "blue";
    drawBoard();
  }
});

// ----------------------
// Encirclement Detection
// ----------------------

// When a point is placed, check all adjacent zones that do not contain an active point of the current player
// If a zone is fully enclosed (does not touch open borders) and contains at least one enemy active point,
// the zone is considered encircled: update score (1 point per enemy active point within),
// mark those enemy points as inactive (disabled), and draw a border connecting the active points that border the zone.
function detectEncirclements(x, y) {
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const globalVisited = new Set();

  directions.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (!inBounds(nx, ny)) return;
    const key = `${nx},${ny}`;
    // Only process zones that do NOT have an active current player's point.
    // Note: disabled points (active:false) are treated as not available.
    if ((!board[ny][nx] || !board[ny][nx].active || board[ny][nx].color !== currentPlayer) && !globalVisited.has(key)) {
      const result = exploreZone(nx, ny, currentPlayer, globalVisited);
      if (result.enclosed && result.containsEnemy) {
        // Update score: +1 for each enemy active point in the zone
        result.cells.forEach(([ci, cj]) => {
          const pt = board[cj][ci];
          if (pt && pt.color !== currentPlayer && pt.active) {
            scores[currentPlayer]++;
            // Mark the point as disabled (encircled)
            pt.active = false;
          }
        });
        // Compute border points: only consider active current player's points bordering the zone
        const borderPoints = getBorderPoints(result.cells, currentPlayer);
        if (borderPoints.length > 0) {
          // Order these border points via convex hull algorithm
          const hull = convexHull(borderPoints);
          encirclements.push(hull);
        }
      }
    }
  });
}

// Flood-fill exploration from (i, j) over cells that do not contain an active point of the player.
// The zone is enclosed if it does not touch any open border (top, bottom, or right). The left margin (column 0) is a wall.
function exploreZone(i, j, player, globalVisited) {
  const stack = [[i, j]];
  const localVisited = new Set();
  let touchesOpenBoundary = false;
  let containsEnemy = false;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (stack.length > 0) {
    const [ci, cj] = stack.pop();
    const key = `${ci},${cj}`;
    if (localVisited.has(key)) continue;
    localVisited.add(key);
    globalVisited.add(key);

    // If the zone reaches an open border (top, bottom, or right), it's not enclosed.
    if (cj === 0 || cj === ROWS - 1 || ci === COLS - 1) {
      touchesOpenBoundary = true;
    }
    // Column 0 (left margin) is a closed wall.

    // If cell contains an active enemy point, note its presence.
    const pt = board[cj][ci];
    if (pt && pt.color !== player && pt.active) {
      containsEnemy = true;
    }

    // Check neighboring cells that do not contain an active point of the player.
    for (const [dx, dy] of directions) {
      const ni = ci + dx;
      const nj = cj + dy;
      if (inBounds(ni, nj)) {
        const nKey = `${ni},${nj}`;
        const neighbor = board[nj][ni];
        if (!localVisited.has(nKey) && (!neighbor || !neighbor.active || neighbor.color !== player)) {
          stack.push([ni, nj]);
        }
      }
    }
  }

  return {
    enclosed: !touchesOpenBoundary,
    containsEnemy,
    cells: Array.from(localVisited).map(s => s.split(",").map(Number))
  };
}

// Get border points from a given zone (list of cells)
// Return only the intersections that are occupied by an active point of the player and border the zone.
function getBorderPoints(zoneCells, player) {
  const borderSet = new Set();
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  zoneCells.forEach(([i, j]) => {
    directions.forEach(([dx, dy]) => {
      const ni = i + dx;
      const nj = j + dy;
      if (inBounds(ni, nj)) {
        const neighbor = board[nj][ni];
        if (neighbor && neighbor.color === player && neighbor.active) {
          borderSet.add(`${ni},${nj}`);
        }
      }
    });
  });

  return Array.from(borderSet).map(s => s.split(",").map(Number));
}

// Convex hull algorithm (Graham Scan) to order the border points
function convexHull(points) {
  if (points.length <= 1) return points.slice();
  points.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const start = points[0];

  function polarAngle(a, b) {
    const angleA = Math.atan2(a[1] - start[1], a[0] - start[0]);
    const angleB = Math.atan2(b[1] - start[1], b[0] - start[0]);
    return angleA - angleB;
  }
  const sorted = points.slice(1).sort(polarAngle);

  const hull = [start];
  sorted.forEach(pt => {
    while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], pt) <= 0) {
      hull.pop();
    }
    hull.push(pt);
  });
  return hull;
}

// Cross product utility for convex hull calculation
function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

// ----------------------
// Resize handling
// ----------------------

// Adjust canvas size when the window is resized
window.addEventListener('resize', () => {
  updateCanvasSize();
  drawBoard();
});

// ----------------------
// Initial Draw
// ----------------------
drawBoard();
