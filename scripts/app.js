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

// Speed counter buttons
const speedCounterBlock = document.querySelectorAll('.counter-block')[0];
const speedPlusBtn = speedCounterBlock.querySelector('.plus');
const speedMinusBtn = speedCounterBlock.querySelector('.minus');
const speedCounter = speedCounterBlock.querySelector('.speed-counter');

// Damage counter buttons
const damageCounterBlock = document.querySelectorAll('.counter-block')[1];
const damagePlusBtn = damageCounterBlock.querySelector('.plus');
const damageMinusBtn = damageCounterBlock.querySelector('.minus');


speedPlusBtn.addEventListener('pointerdown', incrementSpeed);
speedMinusBtn.addEventListener('pointerdown', decrementSpeed);
speedCounter.addEventListener('pointerdown', cycleSpeedState);

damagePlusBtn.addEventListener('pointerdown', incrementDamage);
damageMinusBtn.addEventListener('pointerdown', decrementDamage);

// === HP LOGIC ===
let playerHP = 25;
let rivalHP = 25;

function updateHP() {
  playerScoreEl.innerText = playerHP;
  rivalScoreEl.innerText = rivalHP;
  saveState();
}
function checkOrientation() {
  // Only show warning if in portrait
  if (window.matchMedia("(orientation: portrait)").matches) {
    document.getElementById('orientation-warning').style.display = 'flex';
  } else {
    document.getElementById('orientation-warning').style.display = 'none';
  }
}

// Check on load and whenever orientation changes
window.addEventListener('load', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
window.addEventListener('resize', checkOrientation);



// === INCREMENT DISPLAY (always fades out) ===
function showIncrementDisplay(player, diff) {
  // Find the .hp-row for the right panel
  const row = document.querySelector(`.${player}-panel .hp-row`);
  // Select the existing .increment-display as a child of .hp-row
  const incrementDisplay = row.querySelector('.increment-display');
  // Just update, do NOT create
  incrementDisplay.textContent = diff > 0 ? `+${diff}` : `${diff}`;
  incrementDisplay.style.opacity = 1;

  clearTimeout(incrementDisplay._fadeTimeout);
  incrementDisplay._fadeTimeout = setTimeout(() => {
    incrementDisplay.style.opacity = 0;
  }, SESSION_TIMEOUT);
}

// === SESSION LOGIC (handles session counting for panel taps) ===
const hpSessionState = {
  player: { baseValue: null, lastActionTime: null, _sessionTimer: null },
  rival: { baseValue: null, lastActionTime: null, _sessionTimer: null }
};

function handleHPSession(player, newValue, prevValue) {
  const state = hpSessionState[player];
  const now = Date.now();

  if (state.baseValue === null || !state.lastActionTime || (now - state.lastActionTime > SESSION_TIMEOUT)) {
    state.baseValue = prevValue; // base is always the HP before the first change
  }
  state.lastActionTime = now;
  const diff = newValue - state.baseValue;

  showIncrementDisplay(player, diff);

  clearTimeout(state._sessionTimer);
  state._sessionTimer = setTimeout(() => {
    state.baseValue = null;
    state.lastActionTime = null;
  }, SESSION_TIMEOUT);
}

// === ADJUST HP AND TRIGGER SESSION (for panel buttons only) ===
function adjustHPAndShow(player, amount) {
  if (player === 'player') {
    const prev = playerHP;
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

// === PANEL BUTTONS (manual adjustment triggers session) ===
function setupPanelButton(panelSelector, player, amount) {
  const el = document.querySelector(panelSelector);
  el.addEventListener('pointerdown', () => adjustHPAndShow(player, amount));
}
setupPanelButton('.player-panel .panel-top', 'player', 1);
setupPanelButton('.player-panel .panel-bottom', 'player', -1);
setupPanelButton('.rival-panel .panel-top', 'rival', 1);
setupPanelButton('.rival-panel .panel-bottom', 'rival', -1);

// === DAMAGE BUTTONS (NO SESSION, ONLY SHOW INCREMENT) ===
fullDamageBtn.addEventListener('pointerdown', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  playerHP = Math.max(0, playerHP - dmg);
  updateHP();
  showIncrementDisplay('player', -dmg);
  quickReset();
});

halfDamageBtn.addEventListener('pointerdown', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const applied = -Math.ceil(dmg / 2);
  playerHP = Math.max(0, playerHP + applied);
  updateHP();
  showIncrementDisplay('player', applied);
  quickReset();
});

fullDamageRivalBtn.addEventListener('pointerdown', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  rivalHP = Math.max(0, rivalHP - dmg);
  updateHP();
  showIncrementDisplay('rival', -dmg);
  quickReset();
});

halfDamageRivalBtn.addEventListener('pointerdown', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const applied = -Math.ceil(dmg / 2);
  rivalHP = Math.max(0, rivalHP + applied);
  updateHP();
  showIncrementDisplay('rival', applied);
  quickReset();
});

// === RESET BUTTON ===
document.getElementById("resetBtn").addEventListener("pointerdown", () => {
  resetHoldTimeout = setTimeout(fullReset, 1500);
});
document.getElementById("resetBtn").addEventListener("pointerup", () => {
  clearTimeout(resetHoldTimeout);
  quickReset();
});
document.getElementById("resetBtn").addEventListener("pointerleave", () => {
  clearTimeout(resetHoldTimeout);
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
function incrementSpeed() {
  speedCount++;
  updateSpeedCounter();
}
function decrementSpeed() {
  speedCount--;
  updateSpeedCounter();
}
function cycleSpeedState() {
  if (speedState === 0) { speedState = 1; }
  else if (speedState === 3) { speedState = 1; }
  else { speedState++; }
  updateSpeedCounter();
}
let damageCount = 0;
function updateDamageCounter() { damageCountEl.innerText = damageCount; saveState(); }
function incrementDamage() { damageCount++; updateDamageCounter(); }
function decrementDamage() {
  damageCount--;
  updateDamageCounter();
}
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
let resetTriggered = false;

const resetBtn = document.getElementById("resetBtn");

function startResetHold() {
  resetTriggered = false;
  resetHoldTimeout = setTimeout(() => {
    fullReset();
    quickReset();
    resetTriggered = true;
  }, 2000); // 2 seconds for long tap
}

function endResetHold() {
  clearTimeout(resetHoldTimeout);
  if (!resetTriggered) {
    quickReset();
  }
}

resetBtn.addEventListener("pointerdown", startResetHold);
resetBtn.addEventListener("pointerup", endResetHold);
resetBtn.addEventListener("pointerleave", () => clearTimeout(resetHoldTimeout));
resetBtn.addEventListener("touchstart", startResetHold, { passive: true });
resetBtn.addEventListener("touchend", endResetHold);
resetBtn.addEventListener("mousedown", startResetHold);
resetBtn.addEventListener("mouseup", endResetHold);
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
  // Only prevent default if the target is NOT a button or inside a button
  const now = new Date().getTime();
  if (
    now - lastTouchEnd <= 300 &&
    !event.target.closest('button')
  ) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// === MOBILE SAFETY: Prevent long press, double-tap zoom, and magnify on iOS ===
document.body.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault(); // Prevent multi-touch zoom
    }
}, { passive: false });

document.body.addEventListener('gesturestart', (e) => {
    e.preventDefault(); // Prevent pinch-to-zoom
});

document.body.addEventListener('dblclick', (e) => {
    e.preventDefault(); // Prevent double-tap zoom
});

// === OPTIONAL: Request fullscreen on page load ===
window.addEventListener('load', () => {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { // Safari
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
    }
});
