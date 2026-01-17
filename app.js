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

async function initCamera() {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: useFront ? "user" : "environment", width: 3840, height: 2160 },
            audio: false
        });
        video.srcObject = currentStream;
        if ('wakeLock' in navigator) await navigator.wakeLock.request('screen');
    } catch (e) { alert("Camera Error: Please use HTTPS and allow permissions."); }
}

function setLUT(key) {
    lutFilter.setAttribute('values', LUT_LIBRARY[key]);
    document.querySelectorAll('.lut-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('onclick').includes(key));
    });
    if (navigator.vibrate) navigator.vibrate(15);
}

function switchCamera() {
    useFront = !useFront;
    initCamera();
    if (navigator.vibrate) navigator.vibrate(30);
}

async function takePhoto() {
    if (navigator.vibrate) navigator.vibrate(50);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        document.getElementById('gallery-preview').style.backgroundImage = `url(${url})`;
        const file = new File([blob], `LEICA_${Date.now()}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file] }).catch(() => {});
        } else {
            const a = document.createElement('a'); a.href = url; a.download = file.name; a.click();
        }
    }, 'image/png');
}

document.getElementById('shutter-btn').addEventListener('click', takePhoto);
window.addEventListener('load', initCamera);
