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

// === Timed Increment/Decrement & Reporting for HP ===
function setupTimedHoldHP(element, player, amount) {
  let holdInterval = null;
  let holdStartTime = null;
  let baseValue = null;
  let incrementDisplay = null;

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

  function getAcceleratedInterval() {
    if (!holdStartTime) return 200;
    const holdDuration = Date.now() - holdStartTime;
    if (holdDuration < 1000) return 200;
    if (holdDuration < 2000) return 120;
    if (holdDuration < 4000) return 70;
    return 30;
  }

  function holdAction() {
    adjustHP(player, amount);
    updateIncrementDisplay();
    holdInterval = setTimeout(holdAction, getAcceleratedInterval());
  }

  function startHold() {
    if (baseValue === null) baseValue = getValue();
    holdStartTime = Date.now();
    adjustHP(player, amount);
    updateIncrementDisplay();
    holdInterval = setTimeout(holdAction, getAcceleratedInterval());
  }

  function stopHold() {
    clearTimeout(holdInterval);
    holdInterval = null;
    holdStartTime = null;
    setTimeout(hideIncrementDisplay, 900);
  }

  // Mouse events
  element.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startHold();
  });
  element.addEventListener('mouseup', stopHold);
  element.addEventListener('mouseleave', stopHold);

  // Touch events
  element.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startHold();
  }, { passive: false });
  element.addEventListener('touchend', stopHold);
  element.addEventListener('touchcancel', stopHold);
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

// === HP Panel Hold Handlers (replaces old click events) ===
setupTimedHoldHP(document.querySelector('.player-panel .panel-top'), 'player', 1);
setupTimedHoldHP(document.querySelector('.player-panel .panel-bottom'), 'player', -1);
setupTimedHoldHP(document.querySelector('.rival-panel .panel-top'), 'rival', 1);
setupTimedHoldHP(document.querySelector('.rival-panel .panel-bottom'), 'rival', -1);

// === Full/Half Damage Buttons ===
// Player: Full Damage
fullDamageBtn.addEventListener('click', () => {
  let playerHp = parseInt(playerScoreEl.textContent, 10);
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));

  playerHp = Math.max(playerHp - dmg, 0);
  quickReset();

  playerScoreEl.textContent = playerHp;
  playerHP = playerHp;
  saveState();
});

// Player: Half Damage
halfDamageBtn.addEventListener('click', () => {
  let playerHp = parseInt(playerScoreEl.textContent, 10);
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const half = Math.ceil(dmg / 2);

  playerHp = Math.max(playerHp - half, 0);
  quickReset();

  playerScoreEl.textContent = playerHp;
  playerHP = playerHp;
  saveState();
});

// Rival: Full Damage
fullDamageRivalBtn.addEventListener('click', () => {
  let rivalHp = parseInt(rivalScoreEl.textContent, 10);
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));

  rivalHp = Math.max(rivalHp - dmg, 0);
  quickReset();

  rivalScoreEl.textContent = rivalHp;
  rivalHP = rivalHp;
  saveState();
});

// Rival: Half Damage
halfDamageRivalBtn.addEventListener('click', () => {
  let rivalHp = parseInt(rivalScoreEl.textContent, 10);
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const half = Math.ceil(dmg / 2);

  rivalHp = Math.max(rivalHp - half, 0);
  quickReset();

  rivalScoreEl.textContent = rivalHp;
  rivalHP = rivalHp;
  saveState();
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
