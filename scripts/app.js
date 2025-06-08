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
let defaultPlayerHP = 25;
let defaultRivalHP = 25;

// Try to load custom defaults from localStorage
function loadDefaultHP() {
  const defaults = JSON.parse(localStorage.getItem('uvsDefaultHP') || '{}');
  defaultPlayerHP = defaults.player ?? 25;
  defaultRivalHP = defaults.rival ?? 25;
  defaultSpeed = defaults.speed ?? 0;
  defaultDamage = defaults.damage ?? 0;
  defaultSpeedIcon = defaults.speedIcon ?? "Off";
}
function saveDefaultHP(player, rival, speed, damage, speedIcon) {
  localStorage.setItem('uvsDefaultHP', JSON.stringify({ player, rival, speed, damage, speedIcon }));
}

let defaultSpeed = 0;
let defaultDamage = 0;
let defaultSpeedIcon = "Off";

let playerHP = 25;
let rivalHP = 25;

function updateHP() {
  playerScoreEl.innerText = playerHP;
  rivalScoreEl.innerText = rivalHP;
  saveState();
}



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
  loadDefaultHP();
  speedCount = defaultSpeed;
  damageCount = defaultDamage;
  speedState = ["Off", "High", "Mid", "Low"].indexOf(defaultSpeedIcon);
  if (speedState === -1) speedState = 0;
  updateSpeedCounter();
  updateDamageCounter();
}
function fullReset() {
  quickReset();
  loadDefaultHP();
  playerHP = defaultPlayerHP;
  rivalHP = defaultRivalHP;
  speedCount = defaultSpeed;
  damageCount = defaultDamage;
  speedState = ["Off", "High", "Mid", "Low"].indexOf(defaultSpeedIcon);
  if (speedState === -1) speedState = 0;
  updateSpeedCounter();
  updateDamageCounter();
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
  }, 1500); // 2 seconds for long tap
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
  loadDefaultHP();
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

// === LANDING PAGE LOGIC (always show on load, can close with X) ===
window.addEventListener('DOMContentLoaded', () => {
  const landingPage = document.getElementById('landingPage');
  const closeLandingPage = document.getElementById('closeLandingPage');

  landingPage.style.display = 'flex';

  closeLandingPage?.addEventListener('click', () => {
    landingPage.style.display = 'none';
  });
});

const showLandingPageBtn = document.getElementById('showLandingPageBtn');
const landingPage = document.getElementById('landingPage');

showLandingPageBtn?.addEventListener('click', () => {
  landingPage.style.display = 'flex';
});

// === HP DEFAULTS POPUP ===
function showHPDefaultsPopup() {
  // Create overlay
  let overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.style.zIndex = 99999;
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  // Create popup
  let popup = document.createElement('div');
  popup.style.background = '#222529';
  popup.style.color = '#fff';
  popup.style.padding = '2em 2em 1.5em 2em';
  popup.style.borderRadius = '18px';
  popup.style.boxShadow = '0 2px 28px #000a';
  popup.style.display = 'flex';
  popup.style.flexDirection = 'column';
  popup.style.gap = '1.2em';
  popup.style.minWidth = '260px';
  popup.style.maxWidth = '90vw';
  popup.style.textAlign = 'center';

  popup.innerHTML = `
    <h3 style="margin-bottom:0.5em;">Set Starting Values</h3>
    <label style="display:flex;align-items:center;justify-content:space-between;gap:1em;">
      Player Life: <input id="defaultPlayerHPInput" type="number" min="1" max="99" value="${defaultPlayerHP}" style="width:4em;font-size:1.2em;text-align:center;" />
    </label>
    <label style="display:flex;align-items:center;justify-content:space-between;gap:1em;">
      Rival Life: <input id="defaultRivalHPInput" type="number" min="1" max="99" value="${defaultRivalHP}" style="width:4em;font-size:1.2em;text-align:center;" />
    </label>
    <label style="display:flex;align-items:center;justify-content:space-between;gap:1em;">
      Speed: <input id="defaultSpeedInput" type="number" min="0" max="99" value="${defaultSpeed}" style="width:4em;font-size:1.2em;text-align:center;" />
    </label>
    <label style="display:flex;align-items:center;justify-content:space-between;gap:1em;">
      Damage: <input id="defaultDamageInput" type="number" min="0" max="99" value="${defaultDamage}" style="width:4em;font-size:1.2em;text-align:center;" />
    </label>
    <label style="display:flex;align-items:center;justify-content:space-between;gap:1em;">
      Zone: <select id="defaultSpeedIconInput" style="width:6em;font-size:1.1em;text-align:center;">
        <option value="Off" ${defaultSpeedIcon === "Off" ? "selected" : ""}>Off</option>
        <option value="High" ${defaultSpeedIcon === "High" ? "selected" : ""}>High</option>
        <option value="Mid" ${defaultSpeedIcon === "Mid" ? "selected" : ""}>Mid</option>
        <option value="Low" ${defaultSpeedIcon === "Low" ? "selected" : ""}>Low</option>
      </select>
    </label>
    <div style="display:flex;gap:1em;justify-content:center;margin-top:1em;">
      <button id="saveHPDefaultsBtn" style="padding:0.5em 1.5em;border-radius:8px;background:#0078ff;color:#fff;border:none;font-size:1em;cursor:pointer;">Save</button>
      <button id="resetAllDefaultsBtn" style="padding:0.5em 1.5em;border-radius:8px;background:#ff4444;color:#fff;border:none;font-size:1em;cursor:pointer;">Reset All</button>
      <button id="cancelHPDefaultsBtn" style="padding:0.5em 1.5em;border-radius:8px;background:#444;color:#fff;border:none;font-size:1em;cursor:pointer;">Cancel</button>
    </div>
  `;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Add the ? button inside the popup, absolutely positioned top left
  let landingBtn = document.createElement('button');
  landingBtn.id = 'showLandingPageBtn';
  landingBtn.className = 'icon-button settings-modal-btn';
  landingBtn.innerText = '?';
  landingBtn.title = 'Show help/about';
  popup.style.position = 'relative';
  popup.appendChild(landingBtn);
  popup.style.paddingTop = '2.5em'; // Make room for the button

  landingBtn.onclick = function(e) {
    e.stopPropagation();
    document.body.removeChild(overlay);
    landingPage.style.display = 'flex';
  };

  document.getElementById('defaultPlayerHPInput').focus();

  document.getElementById('saveHPDefaultsBtn').onclick = function() {
    const p = parseInt(document.getElementById('defaultPlayerHPInput').value, 10);
    const r = parseInt(document.getElementById('defaultRivalHPInput').value, 10);
    const s = parseInt(document.getElementById('defaultSpeedInput').value, 10);
    const d = parseInt(document.getElementById('defaultDamageInput').value, 10);
    const si = document.getElementById('defaultSpeedIconInput').value;
    if (p > 0 && r > 0 && s >= 0 && d >= 0) {
      saveDefaultHP(p, r, s, d, si);
      defaultPlayerHP = p;
      defaultRivalHP = r;
      defaultSpeed = s;
      defaultDamage = d;
      defaultSpeedIcon = si;
      fullReset();
      document.body.removeChild(overlay);
    }
  };
  document.getElementById('resetAllDefaultsBtn').onclick = function() {
    saveDefaultHP(25, 25, 0, 0, 'Off');
    defaultPlayerHP = 25;
    defaultRivalHP = 25;
    defaultSpeed = 0;
    defaultDamage = 0;
    defaultSpeedIcon = 'Off';
    fullReset();
    document.body.removeChild(overlay);
  };
  document.getElementById('cancelHPDefaultsBtn').onclick = function() {
    document.body.removeChild(overlay);
  };
  overlay.onclick = function(e) {
    if (e.target === overlay) document.body.removeChild(overlay);
  };
}

// Remove long-press popup setup

const settingsBtn = document.getElementById('settingsBtn');
if (settingsBtn) {
  settingsBtn.addEventListener('click', showHPDefaultsPopup);
}