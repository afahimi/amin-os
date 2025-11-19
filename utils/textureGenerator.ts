import * as THREE from 'three';

export const generateVaporwaveTextures = () => {
    const width = 1024;
    const height = 1024;

    // 1. Grid Texture (Diffuse Map)
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = width;
    gridCanvas.height = height;
    const gridCtx = gridCanvas.getContext('2d')!;

    // Background
    gridCtx.fillStyle = '#000000';
    gridCtx.fillRect(0, 0, width, height);

    // Grid Lines
    gridCtx.lineWidth = 4;
    gridCtx.strokeStyle = '#ff00ff'; // Magenta
    gridCtx.shadowBlur = 10;
    gridCtx.shadowColor = '#00ffff'; // Cyan glow

    const subdivisions = 24;
    const stepX = width / subdivisions;
    const stepY = height / subdivisions;

    for (let i = 0; i <= subdivisions; i++) {
        // Vertical lines
        gridCtx.beginPath();
        gridCtx.moveTo(i * stepX, 0);
        gridCtx.lineTo(i * stepX, height);
        gridCtx.stroke();

        // Horizontal lines
        gridCtx.beginPath();
        gridCtx.moveTo(0, i * stepY);
        gridCtx.lineTo(width, i * stepY);
        gridCtx.stroke();
    }

    const gridTexture = new THREE.CanvasTexture(gridCanvas);
    gridTexture.wrapS = THREE.RepeatWrapping;
    gridTexture.wrapT = THREE.RepeatWrapping;

    // 2. Displacement Map (Height Map)
    // Black center (flat), White sides (mountains)
    const dispCanvas = document.createElement('canvas');
    dispCanvas.width = 512;
    dispCanvas.height = 512;
    const dispCtx = dispCanvas.getContext('2d')!;

    // Fill black (flat)
    dispCtx.fillStyle = '#000000';
    dispCtx.fillRect(0, 0, 512, 512);

    // Draw noise on sides
    // We'll just draw some random gradients for now to simulate "mountains" on the edges
    // Draw noise on sides with Y-axis wrapping
    const drawNoise = (xStart: number, width: number) => {
        // Create a buffer for the noise values to ensure wrapping
        const noiseBuffer: number[][] = [];
        const rows = 512 / 4;
        const cols = width / 4;

        for (let i = 0; i < cols; i++) {
            noiseBuffer[i] = [];
            for (let j = 0; j < rows; j++) {
                // If it's the last row, copy the first row to ensure seamless wrap
                if (j === rows - 1) {
                    noiseBuffer[i][j] = noiseBuffer[i][0];
                } else {
                    noiseBuffer[i][j] = Math.random();
                }
            }
        }

        for (let xStep = 0; xStep < cols; xStep++) {
            const x = xStart + xStep * 4;
            for (let yStep = 0; yStep < rows; yStep++) {
                const y = yStep * 4;

                const noiseVal = noiseBuffer[xStep][yStep];

                if (noiseVal > 0.5) {
                    const intensity = noiseVal * 255;
                    // Fade out towards center
                    const distFromEdge = x < 256 ? x : 512 - x;
                    const fade = Math.max(0, 1 - (distFromEdge / 150));

                    const val = Math.floor(intensity * fade);
                    dispCtx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                    dispCtx.fillRect(x, y, 4, 4);
                }
            }
        }
    };

    // Left mountains
    drawNoise(0, 150);
    // Right mountains
    drawNoise(362, 150);

    const displacementTexture = new THREE.CanvasTexture(dispCanvas);
    displacementTexture.wrapS = THREE.RepeatWrapping;
    displacementTexture.wrapT = THREE.RepeatWrapping;

    // 3. Metalness Map
    // Grid lines are metallic (white), terrain is rough (black)
    const metalCanvas = document.createElement('canvas');
    metalCanvas.width = width;
    metalCanvas.height = height;
    const metalCtx = metalCanvas.getContext('2d')!;

    metalCtx.fillStyle = '#000000'; // Rough
    metalCtx.fillRect(0, 0, width, height);

    metalCtx.lineWidth = 4;
    metalCtx.strokeStyle = '#ffffff'; // Metallic

    for (let i = 0; i <= subdivisions; i++) {
        metalCtx.beginPath();
        metalCtx.moveTo(i * stepX, 0);
        metalCtx.lineTo(i * stepX, height);
        metalCtx.stroke();

        metalCtx.beginPath();
        metalCtx.moveTo(0, i * stepY);
        metalCtx.lineTo(width, i * stepY);
        metalCtx.stroke();
    }

    const metalnessTexture = new THREE.CanvasTexture(metalCanvas);
    metalnessTexture.wrapS = THREE.RepeatWrapping;
    metalnessTexture.wrapT = THREE.RepeatWrapping;

    return {
        gridTexture,
        displacementTexture,
        metalnessTexture
    };
};
