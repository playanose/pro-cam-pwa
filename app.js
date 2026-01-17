async function takePhoto() {
    // 1. Tactile feedback
    if (navigator.vibrate) navigator.vibrate(50);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 2. Match hardware sensor resolution exactly
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 3. Apply the LUT "Bake"
    // This draws the current CSS filter (the LUT) directly into the canvas pixels
    ctx.filter = getComputedStyle(video).filter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 4. Export as Uncompressed PNG
    // Note: We do not pass a quality parameter because PNG is lossless by default
    canvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        
        // Update the UI thumbnail
        document.getElementById('gallery-preview').style.backgroundImage = `url(${url})`;

        // 5. Native Save/Share Dialog
        const file = new File([blob], `PRO_SHOT_${Date.now()}.png`, { type: "image/png" });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'ProCam Uncompressed Photo',
                });
            } catch (err) {
                // Fallback: Trigger a direct download if sharing is cancelled
                const link = document.createElement('a');
                link.href = url;
                link.download = `PRO_SHOT_${Date.now()}.png`;
                link.click();
            }
        }
    }, 'image/png');
}
