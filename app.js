const LUT_LIBRARY = {
    NONE: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0",
    LEICA_VIVID: "1.2 0 0 0 0.05  0 1.1 0 0 0.05  0 0 1.1 0 0  0 0 0 1 0",
    LEICA_MONO: "0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0 0 0 1 0",
    LEICA_NATURAL: "0.9 0.1 0 0 0.02  0.1 0.9 0 0 0.02  0 0 1.0 0 0.05  0 0 0 1 0"
};

let currentStream = null;
const video = document.getElementById('camera-preview');
const lutMatrix = document.getElementById('lut-matrix');
const flash = document.getElementById('flash');

async function initCamera() {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: "environment", 
                aspectRatio: { exact: 1.5 },
                width: { ideal: 4334 }, 
                height: { ideal: 2888 } 
            }
        });
        video.srcObject = currentStream;
        if ('wakeLock' in navigator) await navigator.wakeLock.request('screen');
    } catch (e) {
        // Fallback for strict ratio rejection
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = currentStream;
    }
}

function setLUT(key) {
    lutMatrix.setAttribute('values', LUT_LIBRARY[key]);
    document.querySelectorAll('.lut-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(key));
    });
    if (navigator.vibrate) navigator.vibrate(10);
}

async function takePhoto() {
    flash.classList.add('flash-active');
    setTimeout(() => flash.classList.remove('flash-active'), 150);
    if (navigator.vibrate) navigator.vibrate(50);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 4334;
    canvas.height = 2888;

    // Apply GCam Engine + LUT Bake
    ctx.filter = 'url(#gcam-engine)';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const fileName = `GCAM_32_12MP_${Date.now()}.png`;
        
        // Update Thumb
        document.getElementById('gallery-preview').style.backgroundImage = `url(${url})`;

        // Silent Save
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/png');
}

window.addEventListener('load', initCamera);
document.getElementById('shutter-btn').addEventListener('click', takePhoto);
