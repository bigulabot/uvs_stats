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
  document.getElementById("damageCount").innerText = damageCount;
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
  document.getElementById("playerScore").innerText = playerHP;
  document.getElementById("rivalScore").innerText = rivalHP;
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

// === HP Panel Click Handlers ===

document.querySelector('.player-panel .panel-top').addEventListener('click', () => adjustHP('player', 1));
document.querySelector('.player-panel .panel-bottom').addEventListener('click', () => adjustHP('player', -1));

document.querySelector('.rival-panel .panel-top').addEventListener('click', () => adjustHP('rival', 1));
document.querySelector('.rival-panel .panel-bottom').addEventListener('click', () => adjustHP('rival', -1));

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
