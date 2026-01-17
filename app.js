let currentStream = null;
const video = document.getElementById('camera-preview');
const lutFilter = document.querySelector('#lut-filter feColorMatrix');

// 1. INIT: Start Camera with High-Performance "Continuous" Mode
async function initCamera() {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment", 
                width: { ideal: 3840 }, 
                height: { ideal: 2160 },
                // Requesting continuous focus by default
                focusMode: "continuous",
                exposureMode: "continuous"
            }, 
            audio: false 
        });
        video.srcObject = currentStream;
    } catch (err) {
        console.error("Camera Init Error:", err);
    }
}

// 2. REFINED CAPTURE: Uncompressed PNG
async function takePhoto() {
    if(navigator.vibrate) navigator.vibrate(40);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply LUT Bake
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, 0, 0);
    
    // Save as Lossless PNG
    canvas.toBlob(async (blob) => {
        const file = new File([blob], `PRO_${Date.now()}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file] });
        }
    }, 'image/png');
}

// Event Listeners
document.getElementById('shutter-btn').addEventListener('click', takePhoto);
window.addEventListener('load', initCamera);
