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

// === Session State for Increment Display (per panel) ===
const hpSessionState = {
  player: {
    baseValue: null,
    lastActionTime: null,
    incrementDisplay: null,
    timer: null
  },
  rival: {
    baseValue: null,
    lastActionTime: null,
    incrementDisplay: null,
    timer: null
  }
};

// === Session Logic Helper ===
function handleHPSession(player, newValue, forceNewSession = false) {
  const state = hpSessionState[player];
  const panel = document.querySelector(`.${player}-panel`);
  let now = Date.now();

  // Get or create increment display (inline version)
  if (!state.incrementDisplay) {
    state.incrementDisplay = document.createElement('span');
    state.incrementDisplay.className = 'increment-display';
    // Inline styling, white italic
    state.incrementDisplay.style.position = 'static';
    state.incrementDisplay.style.display = 'inline-block';
    state.incrementDisplay.style.marginLeft = '0.5em';
    state.incrementDisplay.style.verticalAlign = 'middle';
    state.incrementDisplay.style.color = '#fff';
    state.incrementDisplay.style.fontStyle = 'italic';
    state.incrementDisplay.style.fontWeight = 'bold';
    state.incrementDisplay.style.zIndex = '2';
    state.incrementDisplay.style.opacity = 0;
    state.incrementDisplay.style.transition = 'opacity 0.3s';
    state.incrementDisplay.style.pointerEvents = 'none';
    state.incrementDisplay.style.textShadow = '0 0 8px #222';
    // Insert after the score span
    const hpSpan = panel.querySelector('span');
    if (hpSpan && hpSpan.nextSibling) {
      panel.insertBefore(state.incrementDisplay, hpSpan.nextSibling);
    } else if (hpSpan) {
      panel.appendChild(state.incrementDisplay);
    } else {
      panel.appendChild(state.incrementDisplay);
    }
  }

  // New session if paused too long or no baseValue or forced
  if (
    state.baseValue === null ||
    !state.lastActionTime ||
    (now - state.lastActionTime > 700) ||
    forceNewSession
  ) {
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

// === Adjust HP and show increment display (ALL sources: panel taps, buttons) ===
function adjustHPAndShow(player, amount, forceNewSession = false) {
  if (player === 'player') {
    playerHP = Math.max(0, playerHP + amount);
    updateHP();
    handleHPSession('player', playerHP, forceNewSession);
  } else {
    rivalHP = Math.max(0, rivalHP + amount);
    updateHP();
    handleHPSession('rival', rivalHP, forceNewSession);
  }
}

// === HP Panel Click Handlers ===
function setupPanelButton(panelSelector, player, amount) {
  const el = document.querySelector(panelSelector);
  el.addEventListener('click', () => {
    adjustHPAndShow(player, amount);
  });
  el.addEventListener('touchend', () => {
    adjustHPAndShow(player, amount);
  });
}
setupPanelButton('.player-panel .panel-top', 'player', 1);
setupPanelButton('.player-panel .panel-bottom', 'player', -1);
setupPanelButton('.rival-panel .panel-top', 'rival', 1);
setupPanelButton('.rival-panel .panel-bottom', 'rival', -1);

// === Full/Half Damage Buttons with session-based increment display ===
// (NOTE: Always participate in current session, do not force a new session)
fullDamageBtn.addEventListener('click', () => {
  let oldHp = playerHP;
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  let newHp = Math.max(oldHp - dmg, 0);
  quickReset();
  playerHP = newHp;
  updateHP();
  handleHPSession('player', playerHP);
});

halfDamageBtn.addEventListener('click', () => {
  let oldHp = playerHP;
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const half = Math.ceil(dmg / 2);
  let newHp = Math.max(oldHp - half, 0);
  quickReset();
  playerHP = newHp;
  updateHP();
  handleHPSession('player', playerHP);
});

fullDamageRivalBtn.addEventListener('click', () => {
  let oldHp = rivalHP;
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  let newHp = Math.max(oldHp - dmg, 0);
  quickReset();
  rivalHP = newHp;
  updateHP();
  handleHPSession('rival', rivalHP);
});

halfDamageRivalBtn.addEventListener('click', () => {
  let oldHp = rivalHP;
  const dmg = Math.max(0, parseInt(damageCountEl.textContent, 10));
  const half = Math.ceil(dmg / 2);
  let newHp = Math.max(oldHp - half, 0);
  quickReset();
  rivalHP = newHp;
  updateHP();
  handleHPSession('rival', rivalHP);
});

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
