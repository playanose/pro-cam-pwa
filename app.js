const LUT_LIBRARY = {
    NONE: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0",
    KODAK_PORTRA: "1.2 0 0.1 0 0  0.1 1.1 0 0 0  0 0 1.3 0 0  0 0 0 1 0",
    FUJI_VELVIA: "1.4 -0.2 0 0 0  0 1.3 0 0 0  0 0 1.5 0 0  0 0 0 1 0",
    B_W_PANATOMIC: "0.3 0.6 0.1 0 0  0.3 0.6 0.1 0 0  0.3 0.6 0.1 0 0  0 0 0 1 0"
};

let currentStream = null;
const video = document.getElementById('camera-preview');
const lutFilter = document.querySelector('#lut-filter feColorMatrix');

async function initCamera() {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    currentStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: 3840, height: 2160 }, 
        audio: false 
    });
    video.srcObject = currentStream;
}

function setLUT(style) {
    lutFilter.setAttribute('values', LUT_LIBRARY[style]);
    document.querySelectorAll('.lut-btn').forEach(b => b.classList.toggle('active', b.innerText.includes(style.split('_')[0])));
    if(navigator.vibrate) navigator.vibrate(10);
}

async function takePhoto() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, 0, 0);
    
    const blob = await new Promise(res => canvas.toBlob(res, 'image/webp', 0.95));
    const url = URL.createObjectURL(blob);
    document.getElementById('gallery-preview').style.backgroundImage = `url(${url})`;
    
    const file = new File([blob], `PRO_${Date.now()}.webp`, { type: "image/webp" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file] });
    }
}

document.getElementById('shutter-btn').addEventListener('click', takePhoto);
window.addEventListener('load', initCamera);
