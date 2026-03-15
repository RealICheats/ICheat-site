const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const switchBtn = document.getElementById('switchCamera');

let currentFacingMode = 'user'; // 'user' = front, 'environment' = back
let faceDetector;

// Start camera and face detection
async function startCamera() {
  try {
    status.textContent = 'Requesting camera…';

    // Stop previous stream if exists
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    video.srcObject = stream;

    // Wait for video to be ready
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      status.textContent = 'Camera active – detecting faces';
      detectFacesLoop();
    };
  } catch (err) {
    console.error('Camera error:', err);
    status.textContent = 'Camera error: ' + err.message;
  }
}

// Face detection loop
async function detectFacesLoop() {
  if (!video.srcObject) return;

  // Check if FaceDetector is supported
  if (!('FaceDetector' in window)) {
    status.textContent = 'Face detection not supported in this browser';
    return;
  }

  // Create detector once
  if (!faceDetector) {
    faceDetector = new FaceDetector({
      fastMode: true,
      maxDetectedFaces: 5
    });
  }

  try {
    const faces = await faceDetector.detect(video);

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw red boxes around faces
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(255,0,0,0.7)';
    ctx.shadowBlur = 10;

    for (const face of faces) {
      const { top, left, width, height } = face.boundingBox;
      ctx.beginPath();
      ctx.rect(left, top, width, height);
      ctx.stroke();
    }

    // Continue loop
    requestAnimationFrame(detectFacesLoop);
  } catch (err) {
    console.error('Face detection error:', err);
    status.textContent = 'Face detection error';
  }
}

// Switch camera
switchBtn.addEventListener('click', async () => {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  await startCamera();
});

// Start on load
startCamera();

// Cleanup on page leave
window.addEventListener('beforeunload', () => {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
});
