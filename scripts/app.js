// === DOM ELEMENTS ===
const playerScoreEl = document.getElementById("playerScore");
const rivalScoreEl = document.getElementById("rivalScore");
const damageCountEl = document.getElementById("damageCount");
const fullDamageBtn = document.getElementById("fullDamageBtn");
const halfDamageBtn = document.getElementById("halfDamageBtn");
const fullDamageRivalBtn = document.getElementById("fullDamageRivalBtn");
const halfDamageRivalBtn = document.getElementById("halfDamageRivalBtn");

// === Speed Counter Logic ===
let speedCount = 0;
let speedState = 0;
const speedStates = ["Off", "High", "Mid", "Low"];
const speedIcons = {
  "Off": "icons/Off.svg",
  "High": "icons/High.svg",
  "Mid": "icons/Mid.svg",
  "Low": "icons/Low.svg"
};

function updateSpeedCounter() {
  document.getElementById("speedCount").innerText = speedCount;
  document.getElementById("speedIcon").src = speedIcons[speedStates[speedState]];
  saveState();
}

function incrementSpeed() {
  speedCount++;
  updateSpeedCounter();
}

function decrementSpeed() {
  speedCount--;  // Allow negative
  updateSpeedCounter();
}

function cycleSpeedState() {
  if (speedState === 0) {
    speedState = 1;
  } else if (speedState === 3) {
    speedState = 1;
  } else {
    speedState++;
  }
  updateSpeedCounter();
}

// === Damage Counter Logic ===
let damageCount = 0;

function updateDamageCounter() {
  damageCountEl.innerText = damageCount;
  saveState();
}

function incrementDamage() {
  damageCount++;
  updateDamageCounter();
}

function decrementDamage() {
  damageCount--;  // Allow negative
  updateDamageCounter();
}

// === HP Panels Logic ===
let playerHP = 25;
let rivalHP = 25;

function updateHP() {
  playerScoreEl.innerText = playerHP;
  rivalScoreEl.innerText = rivalHP;
  saveState();
}

function adjustHP(player, amount) {
  if (player === 'player') {
    playerHP = Math.max(0, playerHP + amount);
  } else {
    rivalHP = Math.max(0, rivalHP + amount);
  }
  updateHP();
}

// === Timed Session Increment/Decrement & Reporting for HP (Click/Tap Only) ===
function setupTimedHoldHP(element, player, amount) {
  let baseValue = null;
  let incrementDisplay = null;
  let lastClickTime = null;
  let clickSessionTimeout = null;

  // Add increment display element if it doesn't exist
  function ensureIncrementDisplay() {
    incrementDisplay = element.querySelector('.increment-display');
    if (!incrementDisplay) {
      incrementDisplay = document.createElement('div');
      incrementDisplay.className = 'increment-display';
      incrementDisplay.style.position = 'absolute';
      incrementDisplay.style.right = '8px';
      incrementDisplay.style.top = '8px';
      incrementDisplay.style.fontSize = '1.2em';
      incrementDisplay.style.opacity = 0;
      incrementDisplay.style.transition = 'opacity 0.3s';
      element.appendChild(incrementDisplay);
    }
  }

  function getValue() {
    return player === 'player' ? playerHP : rivalHP;
  }

  function updateIncrementDisplay() {
    ensureIncrementDisplay();
    const currentValue = getValue();
    const diff = currentValue - baseValue;
    incrementDisplay.textContent = diff > 0 ? `+${diff}` : `${diff}`;
    incrementDisplay.style.opacity = (diff !== 0) ? 1 : 0;
  }

  function hideIncrementDisplay() {
    if (incrementDisplay) incrementDisplay.style.opacity = 0;
    baseValue = null;
  }

  function singleClick() {
    const now = Date.now();
    if (!baseValue || !lastClickTime || (now - lastClickTime > 700)) {
      // New click session
      baseValue = getValue();
    }
    lastClickTime = now;
    adjustHP(player, amount);
    updateIncrementDisplay();
    clearTimeout(clickSessionTimeout);
    clickSessionTimeout = setTimeout(() => {
      hideIncrementDisplay();
      lastClickTime = null;
    }, 700);
  }

  // Mouse click/tap events only (no hold!)
  element.addEventListener('click', (e) => {
    singleClick();
  });

  element.addEventListener('touchend', (e) => {
    singleClick();
  });
}

// === Show increment display for damage buttons ===
function showIncrementDisplayForHP(panelSelector, oldValue, newValue) {
  const panel = document.querySelector(panelSelector);
  if (!panel) return;

  let incrementDisplay = panel.querySelector('.increment-display');
  if (!incrementDisplay) {
    incrementDisplay = document.createElement('div');
    incrementDisplay.className = 'increment-display';
    incrementDisplay.style.position = 'absolute';
    incrementDisplay.style.right = '8px';
    incrementDisplay.style.top = '8px';
    incrementDisplay.style.fontSize = '1.2em';
    incrementDisplay.style.opacity = 0;
    incrementDisplay.style.transition = 'opacity 0.3s';
    panel.appendChild(incrementDisplay);
  }

  const diff = newValue - oldValue;
  incrementDisplay.textContent = diff > 0 ? `+${diff}` : `${diff}`;
  incrementDisplay.style.opacity = (diff !== 0) ? 1 : 0;

  setTimeout(() => {
    incrementDisplay.style.opacity = 0;
  }, 900);
}

// === Reset Button Logic ===
let resetHoldTimeout = null;

document.getElementById("resetBtn").addEventListener("mousedown", () => {
  resetHoldTimeout = setTimeout(fullReset, 1500);
});

document.getElementById("resetBtn").addEventListener("mouseup", () => {
  clearTimeout(resetHoldTimeout);
  quickReset();
});

document.getElementById("resetBtn").addEventListener("mouseleave", () => {
  clearTimeout(resetHoldTimeout);
});

document.getElementById("resetBtn").addEventListener("touchstart", () => {
  resetHoldTimeout = setTimeout(fullReset, 1500);
}, { passive: true });

document.getElementById("resetBtn").addEventListener("touchend", () => {
  clearTimeout(resetHoldTimeout);
  quickReset();
});

function quickReset() {
  speedCount = 0;
  damageCount = 0;
  speedState = 0; // Reset speed state to Off
  updateSpeedCounter();
  updateDamageCounter();
}

function fullReset() {
  quickReset();
  playerHP = 25;
  rivalHP = 25;
  updateHP();
}

// === HP Panel Click Handlers (no hold, only click/tap with reporting) ===
setupTimedHoldHP(document.querySelector('.player-panel .panel-top'), 'player', 1);
setupTimedHoldHP(document.querySelector('.player-panel .panel-bottom'), 'player', -1);
setupTimedHoldHP(document.querySelector('.rival-panel .panel-top'), 'rival', 1);
setupTimedHoldHP(document.querySelector('.rival-panel .panel-bottom'), 'rival', -1);

// === Full/Half Damage Buttons with increment display ===
// Player: Full Damage
fullDamageBtn.addEventListener('click', () => {
  const oldHp = playerHP;
  let playerHp = parseInt(playerScoreEl.textContent, 10);
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));

  playerHp = Math.max(playerHp - dmg, 0);
  quickReset();

  playerScoreEl.textContent = playerHp;
  playerHP = playerHp;
  saveState();

  showIncrementDisplayForHP('.player-panel', oldHp, playerHp);
});

// Player: Half Damage
halfDamageBtn.addEventListener('click', () => {
  const oldHp = playerHP;
  let playerHp = parseInt(playerScoreEl.textContent, 10);
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const half = Math.ceil(dmg / 2);

  playerHp = Math.max(playerHp - half, 0);
  quickReset();

  playerScoreEl.textContent = playerHp;
  playerHP = playerHp;
  saveState();

  showIncrementDisplayForHP('.player-panel', oldHp, playerHp);
});

// Rival: Full Damage
fullDamageRivalBtn.addEventListener('click', () => {
  const oldHp = rivalHP;
  let rivalHp = parseInt(rivalScoreEl.textContent, 10);
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));

  rivalHp = Math.max(rivalHp - dmg, 0);
  quickReset();

  rivalScoreEl.textContent = rivalHp;
  rivalHP = rivalHp;
  saveState();

  showIncrementDisplayForHP('.rival-panel', oldHp, rivalHp);
});

// Rival: Half Damage
halfDamageRivalBtn.addEventListener('click', () => {
  const oldHp = rivalHP;
  let rivalHp = parseInt(rivalScoreEl.textContent, 10);
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const half = Math.ceil(dmg / 2);

  rivalHp = Math.max(rivalHp - half, 0);
  quickReset();

  rivalScoreEl.textContent = rivalHp;
  rivalHP = rivalHp;
  saveState();

  showIncrementDisplayForHP('.rival-panel', oldHp, rivalHp);
});

// === Persistent State Storage ===
function saveState() {
  const state = {
    speedCount,
    speedState,
    damageCount,
    playerHP,
    rivalHP
  };
  localStorage.setItem("uvsState", JSON.stringify(state));
}

function loadState() {
  const stateStr = localStorage.getItem("uvsState");
  if (stateStr) {
    const state = JSON.parse(stateStr);
    speedCount = state.speedCount ?? 0;
    speedState = state.speedState ?? 0;
    damageCount = state.damageCount ?? 0;
    playerHP = state.playerHP ?? 25;
    rivalHP = state.rivalHP ?? 25;
  }
}

// === Init ===
window.onload = function() {
  loadState();
  updateSpeedCounter();
  updateDamageCounter();
  updateHP();
}

document.addEventListener('touchmove', function (event) {
  if (event.touches.length > 1) {
    event.preventDefault(); // Disable pinch zoom
  }
}, { passive: false });

// Prevent pinch and double-tap zoom
document.addEventListener('gesturestart', function (event) {
  event.preventDefault();
});

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = new Date().getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// === Viewport Height Adjustment ===
function updateViewportHeight() {
  const viewportHeight = window.innerHeight;
  document.querySelector('.main-container').style.height = `${viewportHeight}px`;
}

window.addEventListener('resize', updateViewportHeight);
updateViewportHeight(); // Initial call
