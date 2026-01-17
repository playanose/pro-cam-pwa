const LUT_LIBRARY = {
    NONE: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0",
    VINTAGE: "1.1 0 0.1 0 0  0.1 1 0 0 0  0 0 1.2 0 0  0 0 0 1 0",
    MONO: "0.2 0.7 0.1 0 0  0.2 0.7 0.1 0 0  0.2 0.7 0.1 0 0  0 0 0 1 0",
    CLASSIC: "0.9 0.1 0 0 0  0.1 0.9 0 0 0  0 0 1 0 0  0 0 0 1 0"
};

let currentStream = null;
let useFront = false;
const video = document.getElementById('camera-preview');
const lutMatrix = document.getElementById('lut-matrix');

async function initCamera() {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: useFront ? "user" : "environment",
                width: { ideal: 4096 }, // Requests maximum sensor width
                height: { ideal: 3072 } 
            }
        });
        video.srcObject = currentStream;
        if ('wakeLock' in navigator) await navigator.wakeLock.request('screen');
    } catch (e) {
        alert("Camera access required for PureCam.");
    }
}

function setLUT(key) {
    lutMatrix.setAttribute('values', LUT_LIBRARY[key]);
    document.querySelectorAll('.lut-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(key));
    });
}

function switchCamera() {
    useFront = !useFront;
    initCamera();
}

async function takePhoto() {
    // Shutter Visual
    const flash = document.getElementById('flash');
    flash.classList.add('flash-active');
    setTimeout(() => flash.classList.remove('flash-active'), 100);
    if (navigator.vibrate) navigator.vibrate(40);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Exact Original Hardware Dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Zero Processing Passthrough
    ctx.filter = 'url(#pure-engine)';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SENSOR_RAW_${canvas.width}x${canvas.height}_${Date.now()}.png`;
        link.click();
        
        document.getElementById('gallery-preview').style.backgroundImage = `url(${url})`;
    }, 'image/png');
}

window.addEventListener('load', initCamera);
document.getElementById('shutter-btn').addEventListener('click', takePhoto);
