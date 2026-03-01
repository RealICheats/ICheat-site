let vibrationEnabled = false;
let gamepadIndex = -1;

const statusLight = document.getElementById('statusLight');
const statusText = document.getElementById('statusText');
const vibrateToggle = document.getElementById('vibrateToggle');
const connectedInfo = document.getElementById('connectedInfo');
const controllerName = document.getElementById('controllerName');

// Listen for connection/disconnection events
window.addEventListener('gamepadconnected', (e) => {
  console.log('Gamepad connected:', e.gamepad);
  detectGamepad();
});

window.addEventListener('gamepaddisconnected', (e) => {
  console.log('Gamepad disconnected:', e.gamepad);
  updateStatus(false, null);
});

// Poll to detect changes (some browsers need this)
setInterval(detectGamepad, 1000);

// Initial check
detectGamepad();

function detectGamepad() {
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      gamepadIndex = i;
      updateStatus(true, gamepads[i]);
      return;
    }
  }
  updateStatus(false, null);
}

function updateStatus(connected, gamepad) {
  if (connected && gamepad) {
    statusLight.className = 'status-light green';
    statusText.textContent = 'Controller Connected!';
    connectedInfo.style.display = 'block';
    controllerName.textContent = gamepad.id.split('(')[0] || 'Unknown Controller';
    vibrationEnabled = false;
    vibrateToggle.textContent = 'Connect & Test Vibration';
    vibrateToggle.classList.remove('vibrate-on');
  } else {
    statusLight.className = 'status-light red';
    statusText.textContent = 'No Controller Connected';
    connectedInfo.style.display = 'none';
    gamepadIndex = -1;
  }
}

// Toggle button logic
vibrateToggle.addEventListener('click', () => {
  if (gamepadIndex === -1) {
    alert('Connect a controller and press any button first!');
    detectGamepad();
    return;
  }

  vibrationEnabled = !vibrationEnabled;

  if (vibrationEnabled) {
    vibrateToggle.textContent = 'Vibration ON (Click to Stop)';
    vibrateToggle.classList.add('vibrate-on');
    testVibration();
  } else {
    vibrateToggle.textContent = 'Vibration OFF (Click to Start)';
    vibrateToggle.classList.remove('vibrate-on');
    stopVibration();
  }
});

function testVibration() {
  const gamepads = navigator.getGamepads();
  const gp = gamepads[gamepadIndex];

  if (!gp) return;

  // Chrome/Edge style
  if (gp.vibrationActuator && gp.vibrationActuator.playEffect) {
    try {
      gp.vibrationActuator.playEffect('dual-rumble', {
        duration: 500,
        startDelay: 0,
        strongMagnitude: 0.8,
        weakMagnitude: 1.0
      });
    } catch (e) {
      console.log('Vibration failed:', e);
    }
  }
  // Standard hapticActuators fallback
  else if (gp.hapticActuators && gp.hapticActuators.length > 0) {
    try {
      gp.hapticActuators[0].pulse(1.0, 500);
    } catch (e) {
      console.log('Haptic failed:', e);
    }
  } else {
    alert('Vibration not supported on this controller/browser');
  }
}

function stopVibration() {
  const gamepads = navigator.getGamepads();
  const gp = gamepads[gamepadIndex];
  
  if (gp && gp.vibrationActuator && gp.vibrationActuator.reset) {
    gp.vibrationActuator.reset();
  }
}
