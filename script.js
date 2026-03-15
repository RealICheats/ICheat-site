const video = document.getElementById('video');
const status = document.getElementById('status');
const switchBtn = document.getElementById('switchCamera');

let currentFacingMode = 'user'; // 'user' = front camera, 'environment' = back camera

// Start camera
async function startCamera() {
  try {
    status.textContent = 'Requesting camera access…';

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    video.srcObject = stream;
    status.textContent = 'Camera active';
  } catch (err) {
    console.error('Camera error:', err);
    status.textContent = 'Cannot access camera: ' + err.message;
  }
}

// Switch between front and back camera
switchBtn.addEventListener('click', async () => {
  // Stop current stream
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }

  // Toggle camera
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  
  // Restart camera with new facing mode
  await startCamera();
});

// Start on page load
startCamera();

// Stop camera when leaving the page (good practice)
window.addEventListener('beforeunload', () => {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
});
