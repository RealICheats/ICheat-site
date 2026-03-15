const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const switchBtn = document.getElementById('switchCamera');

let currentFacingMode = 'user'; // 'user' = front, 'environment' = back

// Load MediaPipe Face Mesh
async function loadFaceMesh() {
  status.textContent = 'Loading face detection model…';
  const { FaceMesh } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js');

  const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 5,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(onResults);

  return faceMesh;
}

// Start camera
async function startCamera() {
  try {
    status.textContent = 'Requesting camera…';

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

    video.onloadedmetadata = async () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      status.textContent = 'Camera active – face tracking started';
      const faceMesh = await loadFaceMesh();
      sendToMediaPipe(faceMesh);
    };
  } catch (err) {
    console.error('Camera error:', err);
    status.textContent = 'Camera error: ' + err.message;
  }
}

// Process frames with MediaPipe
function sendToMediaPipe(faceMesh) {
  const processFrame = async () => {
    if (!video.srcObject) return;

    await faceMesh.send({ image: video });
    requestAnimationFrame(processFrame);
  };
  processFrame();
}

function onResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      // Simple bounding box from landmarks (min/max points)
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const lm of landmarks) {
        minX = Math.min(minX, lm.x * canvas.width);
        minY = Math.min(minY, lm.y * canvas.height);
        maxX = Math.max(maxX, lm.x * canvas.width);
        maxY = Math.max(maxY, lm.y * canvas.height);
      }

      ctx.strokeStyle = 'red';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(255,0,0,0.7)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.rect(minX, minY, maxX - minX, maxY - minY);
      ctx.stroke();
    }
  }
}

// Switch camera
switchBtn.addEventListener('click', async () => {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  await startCamera();
});

// Start everything
startCamera();

// Cleanup
window.addEventListener('beforeunload', () => {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
});
