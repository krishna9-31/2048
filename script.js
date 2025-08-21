const boardSize = 4;
const boardContainer = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const restartButton = document.getElementById('restart-button');

let tiles = [];
let score = 0;

// Load best score from localStorage or start at 0
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
bestScoreElement.textContent = bestScore;

function initBoard() {
  tiles = Array(boardSize * boardSize).fill(0);
  score = 0;
  updateScore();
  generateRandomTile();
  generateRandomTile();
  renderBoard();
}

function renderBoard() {
  boardContainer.innerHTML = '';
  for (let i = 0; i < tiles.length; i++) {
    const value = tiles[i];
    const tileDiv = document.createElement('div');
    tileDiv.classList.add('tile');
    tileDiv.textContent = value === 0 ? '' : value;
    tileDiv.setAttribute('data-value', value);
    boardContainer.appendChild(tileDiv);
  }
}

function generateRandomTile() {
  const emptyIndices = tiles
    .map((val, idx) => (val === 0 ? idx : -1))
    .filter(idx => idx !== -1);

  if (emptyIndices.length === 0) return false;

  const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  tiles[randomIndex] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function updateScore() {
  scoreElement.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    bestScoreElement.textContent = bestScore;
    localStorage.setItem('bestScore', bestScore);
  }
}

function slideAndCombine(arr) {
  arr = arr.filter(v => v !== 0);

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr[i + 1] = 0;
      i++;
    }
  }

  arr = arr.filter(v => v !== 0);
  while (arr.length < boardSize) {
    arr.push(0);
  }
  return arr;
}

function move(direction) {
  let moved = false;
  let newTiles = tiles.slice();

  if (direction === 'left' || direction === 'right') {
    for (let row = 0; row < boardSize; row++) {
      let rowTiles = [];
      for (let col = 0; col < boardSize; col++) {
        rowTiles.push(tiles[row * boardSize + col]);
      }
      if (direction === 'right') rowTiles.reverse();

      const newRow = slideAndCombine(rowTiles);

      if (direction === 'right') newRow.reverse();

      for (let col = 0; col < boardSize; col++) {
        const idx = row * boardSize + col;
        if (newTiles[idx] !== newRow[col]) {
          moved = true;
          newTiles[idx] = newRow[col];
        }
      }
    }
  } else if (direction === 'up' || direction === 'down') {
    for (let col = 0; col < boardSize; col++) {
      let colTiles = [];
      for (let row = 0; row < boardSize; row++) {
        colTiles.push(tiles[row * boardSize + col]);
      }
      if (direction === 'down') colTiles.reverse();

      const newCol = slideAndCombine(colTiles);

      if (direction === 'down') newCol.reverse();

      for (let row = 0; row < boardSize; row++) {
        const idx = row * boardSize + col;
        if (newTiles[idx] !== newCol[row]) {
          moved = true;
          newTiles[idx] = newCol[row];
        }
      }
    }
  }

  if (moved) {
    tiles = newTiles;
    generateRandomTile();
    updateScore();
    renderBoard();

    if (checkGameOver()) {
      setTimeout(() => alert(`Game Over! Your score: ${score}`), 100);
    }
  }
}

function checkGameOver() {
  if (tiles.includes(0)) return false;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize - 1; col++) {
      if (tiles[row * boardSize + col] === tiles[row * boardSize + col + 1]) return false;
    }
  }

  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row < boardSize - 1; row++) {
      if (tiles[row * boardSize + col] === tiles[(row + 1) * boardSize + col]) return false;
    }
  }

  return true;
}

function handleKeyDown(event) {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      move('left');
      break;
    case 'ArrowRight':
      event.preventDefault();
      move('right');
      break;
    case 'ArrowUp':
      event.preventDefault();
      move('up');
      break;
    case 'ArrowDown':
      event.preventDefault();
      move('down');
      break;
  }
}

restartButton.addEventListener('click', initBoard);
window.addEventListener('keydown', handleKeyDown);

initBoard();
