const LUT_LIBRARY = {
    NONE: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0",
    LEICA_VIVID: "1.2 0 0 0 0.05  0 1.1 0 0 0.05  0 0 1.1 0 0  0 0 0 1 0",
    LEICA_MONO: "0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0 0 0 1 0",
    LEICA_NATURAL: "0.9 0.1 0 0 0.02  0.1 0.9 0 0 0.02  0 0 1.0 0 0.05  0 0 0 1 0",
    KODAK_PORTRA: "1.2 0 0.1 0 0  0.1 1.1 0 0 0  0 0 1.3 0 0  0 0 0 1 0"
};

let currentStream = null;
let useFront = false;
const video = document.getElementById('camera-preview');
const lutFilter = document.querySelector('#lut-filter feColorMatrix');
const flash = document.getElementById('flash-overlay');

async function initCamera() {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: useFront ? "user" : "environment", width: 3840, height: 2160 },
            audio: false
        });
        video.srcObject = currentStream;
        if ('wakeLock' in navigator) await navigator.wakeLock.request('screen').catch(()=>{});
    } catch (e) { alert("Enable Camera Access via HTTPS"); }
}

function setLUT(key) {
    lutFilter.setAttribute('values', LUT_LIBRARY[key]);
    document.querySelectorAll('.lut-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('onclick').includes(key));
    });
    if (navigator.vibrate) navigator.vibrate(10);
}

function switchCamera() {
    useFront = !useFront;
    initCamera();
    if (navigator.vibrate) navigator.vibrate(30);
}

function triggerFlash() {
    flash.classList.remove('flash-active');
    void flash.offsetWidth; // Force reflow
    flash.classList.add('flash-active');
}

async function takePhoto() {
    triggerFlash();
    if (navigator.vibrate) navigator.vibrate(50);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Bake the LUT into the image
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const fileName = `PRO_LEICA_${Date.now()}.png`;

        // Update UI Thumbnail
        document.getElementById('gallery-preview').style.backgroundImage = `url(${url})`;

        // SILENT AUTO-SAVE
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click(); // Triggers direct save to downloads

        // Clean up memory
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/png');
}

document.getElementById('shutter-btn').addEventListener('click', takePhoto);
window.addEventListener('load', initCamera);
