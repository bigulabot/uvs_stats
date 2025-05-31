// === DOM ELEMENTS ===
const playerScoreEl = document.getElementById("playerScore");
const rivalScoreEl = document.getElementById("rivalScore");
const damageCountEl = document.getElementById("damageCount");
const fullDamageBtn = document.getElementById("fullDamageBtn");
const halfDamageBtn = document.getElementById("halfDamageBtn");
const fullDamageRivalBtn = document.getElementById("fullDamageRivalBtn");
const halfDamageRivalBtn = document.getElementById("halfDamageRivalBtn");

// === HP logic ===
let playerHP = 25;
let rivalHP = 25;

function updateHP() {
  playerScoreEl.innerText = playerHP;
  rivalScoreEl.innerText = rivalHP;
  saveState();
}

// === Session State for Increment Display (per panel) ===
const hpSessionState = {
  player: { baseValue: null, lastActionTime: null, incrementDisplay: null, timer: null },
  rival: { baseValue: null, lastActionTime: null, incrementDisplay: null, timer: null }
};

// === Session Logic Helper ===
function handleHPSession(player, newValue) {
  const state = hpSessionState[player];
  const row = document.querySelector(`.${player}-panel .hp-row`);
  let now = Date.now();

  // Get or create increment display (next to HP value)
  if (!state.incrementDisplay) {
    state.incrementDisplay = document.createElement('span');
    state.incrementDisplay.className = 'increment-display';
    const hpSpan = row.querySelector('span');
    if (hpSpan && hpSpan.nextSibling) {
      row.insertBefore(state.incrementDisplay, hpSpan.nextSibling);
    } else {
      row.appendChild(state.incrementDisplay);
    }
  }

  // New session if paused too long or no baseValue
  if (state.baseValue === null || !state.lastActionTime || (now - state.lastActionTime > 700)) {
    state.baseValue = newValue;
  }

  state.lastActionTime = now;
  const diff = newValue - state.baseValue;
  state.incrementDisplay.textContent = diff > 0 ? `+${diff}` : `${diff}`;
  state.incrementDisplay.style.opacity = diff !== 0 ? 1 : 0;

  // Reset timer
  clearTimeout(state.timer);
  state.timer = setTimeout(() => {
    state.incrementDisplay.style.opacity = 0;
    state.baseValue = null;
    state.lastActionTime = null;
  }, 700);
}

// === HP Adjustment & Session Display (ALL sources) ===
function adjustHPAndShow(player, amount) {
  if (player === 'player') {
    playerHP = Math.max(0, playerHP + amount);
    updateHP();
    handleHPSession('player', playerHP);
  } else {
    rivalHP = Math.max(0, rivalHP + amount);
    updateHP();
    handleHPSession('rival', rivalHP);
  }
}

// === HP Panel Click Handlers ===
function setupPanelButton(panelSelector, player, amount) {
  const el = document.querySelector(panelSelector);
  el.addEventListener('click', () => adjustHPAndShow(player, amount));
  el.addEventListener('touchend', () => adjustHPAndShow(player, amount));
}
setupPanelButton('.player-panel .panel-top', 'player', 1);
setupPanelButton('.player-panel .panel-bottom', 'player', -1);
setupPanelButton('.rival-panel .panel-top', 'rival', 1);
setupPanelButton('.rival-panel .panel-bottom', 'rival', -1);

// === Full/Half Damage Buttons with session-based increment display ===
fullDamageBtn.addEventListener('click', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  adjustHPAndShow('player', -dmg);
  quickReset();
});
halfDamageBtn.addEventListener('click', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  adjustHPAndShow('player', -Math.ceil(dmg / 2));
  quickReset();
});
fullDamageRivalBtn.addEventListener('click', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  adjustHPAndShow('rival', -dmg);
  quickReset();
});
halfDamageRivalBtn.addEventListener('click', () => {
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  adjustHPAndShow('rival', -Math.ceil(dmg / 2));
  quickReset();
});

// === Damage & Speed Logic, Storage, Reset, etc. ===
// (Unchanged; keep your previous logic for these parts)
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
