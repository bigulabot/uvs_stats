// === CONFIG: Timeout for increment session (ms) ===
const SESSION_TIMEOUT = 1500; // 1.5 seconds

// === DOM ELEMENTS ===
const playerScoreEl = document.getElementById("playerScore");
const rivalScoreEl = document.getElementById("rivalScore");
const damageCountEl = document.getElementById("damageCount");
const fullDamageBtn = document.getElementById("fullDamageBtn");
const halfDamageBtn = document.getElementById("halfDamageBtn");
const fullDamageRivalBtn = document.getElementById("fullDamageRivalBtn");
const halfDamageRivalBtn = document.getElementById("halfDamageRivalBtn");

// === HP LOGIC ===
let playerHP = 25;
let rivalHP = 25;

function updateHP() {
  playerScoreEl.innerText = playerHP;
  rivalScoreEl.innerText = rivalHP;
  saveState();
}

// === INCREMENT DISPLAY (DOM Manipulation) ===
function showIncrementDisplay(player, diff) {
  const row = document.querySelector(`.${player}-panel .hp-row`);
  let incrementDisplay = row.querySelector('.increment-display');
  if (!incrementDisplay) {
    incrementDisplay = document.createElement('span');
    incrementDisplay.className = 'increment-display';
    row.appendChild(incrementDisplay);
  }
  incrementDisplay.textContent = diff > 0 ? `+${diff}` : `${diff}`;
  incrementDisplay.style.opacity = diff !== 0 ? 1 : 0;
  return incrementDisplay;
}

// === SESSION LOGIC (tracks net change, calls showIncrementDisplay, and handles fade) ===
const hpSessionState = {
  player: { baseValue: null, lastActionTime: null, _sessionTimer: null },
  rival: { baseValue: null, lastActionTime: null, _sessionTimer: null }
};

function handleHPSession(player, newValue) {
  const state = hpSessionState[player];
  const now = Date.now();

  // New session if paused too long or no baseValue
  if (state.baseValue === null || !state.lastActionTime || (now - state.lastActionTime > SESSION_TIMEOUT)) {
    state.baseValue = newValue;
  }
  state.lastActionTime = now;
  const diff = newValue - state.baseValue;

  // Show/update the increment display and manage combined timer
  const incrementDisplay = showIncrementDisplay(player, diff);

  clearTimeout(state._sessionTimer);
  state._sessionTimer = setTimeout(() => {
    // Fade out increment display
    if (incrementDisplay) incrementDisplay.style.opacity = 0;
    // Reset session logic
    state.baseValue = null;
    state.lastActionTime = null;
  }, SESSION_TIMEOUT);
}

// === HP ADJUSTMENT & SESSION UPDATE  ===
function adjustHPAndShow(player, amount) {
  if (player === 'player') {
    const prev = playerHP; // store previous value
    playerHP = Math.max(0, playerHP + amount);
    updateHP();
    handleHPSession('player', playerHP, prev);
  } else {
    const prev = rivalHP;
    rivalHP = Math.max(0, rivalHP + amount);
    updateHP();
    handleHPSession('rival', rivalHP, prev);
  }
}

function handleHPSession(player, newValue, prevValue) {
  const state = hpSessionState[player];
  const now = Date.now();

  if (state.baseValue === null || !state.lastActionTime || (now - state.lastActionTime > SESSION_TIMEOUT)) {
    state.baseValue = prevValue; // Use value BEFORE the change
  }
  state.lastActionTime = now;
  const diff = newValue - state.baseValue;
}


// === HP PANEL CLICK HANDLERS ===
function setupPanelButton(panelSelector, player, amount) {
  const el = document.querySelector(panelSelector);
  el.addEventListener('click', () => adjustHPAndShow(player, amount));
  el.addEventListener('touchend', () => adjustHPAndShow(player, amount));
}
setupPanelButton('.player-panel .panel-top', 'player', 1);
setupPanelButton('.player-panel .panel-bottom', 'player', -1);
setupPanelButton('.rival-panel .panel-top', 'rival', 1);
setupPanelButton('.rival-panel .panel-bottom', 'rival', -1);

// === FULL/HALF DAMAGE BUTTONS ===
fullDamageBtn.addEventListener('click', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  playerHP = Math.max(0, playerHP - dmg);     // Change HP directly
  updateHP();                                 // Refresh display
  showIncrementDisplay('player', -dmg);       // Show -dmg in increment display
  quickReset();
});

halfDamageBtn.addEventListener('click', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const applied = -Math.ceil(dmg / 2);
  playerHP = Math.max(0, playerHP + applied); // (applied is negative)
  updateHP();
  showIncrementDisplay('player', applied);
  quickReset();
});

fullDamageRivalBtn.addEventListener('click', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  rivalHP = Math.max(0, rivalHP - dmg);
  updateHP();
  showIncrementDisplay('rival', -dmg);
  quickReset();
});

halfDamageRivalBtn.addEventListener('click', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const applied = -Math.ceil(dmg / 2);
  rivalHP = Math.max(0, rivalHP + applied);
  updateHP();
  showIncrementDisplay('rival', applied);
  quickReset();
});


// === DAMAGE & SPEED LOGIC, STORAGE, RESET, ETC. ===
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
function incrementSpeed() { speedCount++; updateSpeedCounter(); }
function decrementSpeed() { speedCount--; updateSpeedCounter(); }
function cycleSpeedState() {
  if (speedState === 0) { speedState = 1; }
  else if (speedState === 3) { speedState = 1; }
  else { speedState++; }
  updateSpeedCounter();
}
let damageCount = 0;
function updateDamageCounter() { damageCountEl.innerText = damageCount; saveState(); }
function incrementDamage() { damageCount++; updateDamageCounter(); }
function decrementDamage() { damageCount--; updateDamageCounter(); }
function quickReset() {
  speedCount = 0;
  damageCount = 0;
  speedState = 0;
  updateSpeedCounter();
  updateDamageCounter();
}
function fullReset() {
  quickReset();
  playerHP = 25;
  rivalHP = 25;
  updateHP();
}
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
window.onload = function() {
  loadState();
  updateSpeedCounter();
  updateDamageCounter();
  updateHP();
}
document.addEventListener('touchmove', function (event) {
  if (event.touches.length > 1) { event.preventDefault(); }
}, { passive: false });
document.addEventListener('gesturestart', function (event) { event.preventDefault(); });
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = new Date().getTime();
  if (now - lastTouchEnd <= 300) { event.preventDefault(); }
  lastTouchEnd = now;
}, false);
function updateViewportHeight() {
  const viewportHeight = window.innerHeight;
  document.querySelector('.main-container').style.height = `${viewportHeight}px`;
}
window.addEventListener('resize', updateViewportHeight);
updateViewportHeight(); // Initial call
