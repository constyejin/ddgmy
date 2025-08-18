import canvasManager from 'https://cdn.jsdelivr.net/gh/gh-o-st/utilities@stable/canvasmanager.js';
import ParticleSystem from 'https://cdn.jsdelivr.net/gh/gh-o-st/utilities@stable/particle.js';
import Color from 'https://cdn.jsdelivr.net/gh/gh-o-st/utilities@stable/color.js';
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';

const manager = canvasManager().attach('earth');
const ctx = manager.context('2d');
// manager.resize('full', 'full').listen('resize', 300).listen('dpr', 1000);

const globePane = new Pane({
    title: 'Globe Settings',
    expanded: true,
});



const geometryFolder = globePane.addFolder({
    title: 'Geometry',
    expanded: true,
});

const globeSettings = {
    radius: 0.6,   // Sphere radius (normalized, not pixels)
    nLat: 120,       // Number of latitude divisions (vertical bands)
    nLon: 120,      // Number of longitude divisions (horizontal segments)
    nFrames: 3,     // Number of frames for depth sorting (used for visual effects)
    colors: {
        land: '#4d608adc',        // Color for land particles (hex RGBA)
        ocean: '#2D19C8',       // Color for ocean particles (hex RGBA)
        background: '#fff',  // Canvas background color (hex RGBA)
    },
    particleSizeLand: 1.69,     // Particle size for land
    particleSizeOcean: 0.7,    // Particle size for ocean
    rotationSpeed: 0.01,       // Radians per frame for globe rotation
    xray: 0.01,                // X-ray effect: controls cutaway depth for rendering
    showPoleLine: false,       // Whether to draw a line between poles
};

const EarthHeightmap = class {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.imageData = null;
        this.width = 0;
        this.height = 0;
        this.loaded = false;
    }

    async load() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.width = img.width;
                this.height = img.height;
                this.canvas.width = this.width;
                this.canvas.height = this.height;

                this.ctx.drawImage(img, 0, 0);
                this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
                this.loaded = true;

                console.log(`Earth heightmap loaded: ${this.width}×${this.height}`);
                resolve(this);
            };
            img.onerror = () => reject(new Error('Failed to load heightmap'));
            // img.crossOrigin = 'anonymous'; 
            img.src = '/ver2/assets/images/ddg_value/earth.png'; 
        });
    }

    latLonToPixel(lat, lon) {
        lat = Math.max(-90, Math.min(90, lat));
        lon = Math.max(-180, Math.min(180, lon));

        const normalizedLon = (lon + 180) / 360;
        const normalizedLat = (90 - lat) / 180;

        return {
            x: Math.floor(normalizedLon * (this.width - 1)),
            y: Math.floor(normalizedLat * (this.height - 1))
        };
    }

    sampleRGB(lat, lon) {
        if (!this.loaded) return { r: 0, g: 0, b: 0 };

        const { x, y } = this.latLonToPixel(lat, lon);
        const index = (y * this.width + x) * 4;

        return {
            r: this.imageData.data[index],
            g: this.imageData.data[index + 1], 
            b: this.imageData.data[index + 2]
        };
    }

    getElevation(lat, lon) {
        const rgb = this.sampleRGB(lat, lon);
        const brightness = (rgb.r + rgb.g + rgb.b) / 3;
        return (brightness / 255) * 6000 - 1000;
    }

    isLand(lat, lon) {
        const rgb = this.sampleRGB(lat, lon);
        const isDeepBlue = rgb.b > rgb.r + 20 && rgb.b > rgb.g + 20;
        const isDarkWater = rgb.r < 50 && rgb.g < 50 && rgb.b < 80;
        return !(isDeepBlue || isDarkWater);
    }

    getTerrainColor(lat, lon) {
        const rgb = this.sampleRGB(lat, lon);
        return new Color(rgb.r, rgb.g, rgb.b);
    }
};

const generateSphericalShellGrid = (radius, nLat, nLon) => {
    const positions = [];
    for (let i = 0; i < nLat; i++) {

        const lat = Math.PI * (i / (nLat - 1)) - Math.PI/2; 
        for (let j = 0; j < nLon; j++) {

            const lon = 2 * Math.PI * (j / nLon) - Math.PI; 

            const x = radius * Math.cos(lat) * Math.cos(lon);  
            const y = radius * Math.cos(lat) * Math.sin(lon);  
            const z = radius * Math.sin(lat);                   

            const latDeg = lat * 180 / Math.PI;
            const lonDeg = lon * 180 / Math.PI;

            positions.push({ 
                x, y, z,
                lat: latDeg,
                lon: lonDeg,
                isNorthPole: i === nLat - 1,
                isSouthPole: i === 0, 
                isEquator: Math.abs(i - Math.floor(nLat / 2)) < 2
            });
        }
    }
    return positions;
};

const heightmap = new EarthHeightmap();
let particlePositions = [];
let particles = null;
let isLoading = true;
let needsUpdate = true;

async function initializeEarth() {
    try {

        globeSettings.nLon = globeSettings.nLat * 2;
        console.log('Loading Earth heightmap...');
        await heightmap.load();

        console.log('Generating particle grid...');
        particlePositions = generateSphericalShellGrid(globeSettings.radius, globeSettings.nLat, globeSettings.nLon);

        console.log('Processing terrain data...');

        for (const particle of particlePositions) {
            particle.isLand = heightmap.isLand(particle.lat, particle.lon);
            particle.terrainColor = heightmap.getTerrainColor(particle.lat, particle.lon);
            particle.elevation = heightmap.getElevation(particle.lat, particle.lon);
        }

        particles = new ParticleSystem(particlePositions);

        const landCount = particlePositions.filter(p => p.isLand).length;
        const oceanCount = particlePositions.length - landCount;
        console.log(`Earth loaded: ${landCount} land particles, ${oceanCount} ocean particles`);

        isLoading = false;
    } catch (error) {
        console.error('Failed to load Earth data:', error);
        isLoading = false;
    }
}

initializeEarth();

let configChangeTimeout = null;
const DEBOUNCE_MS = 300; 
globePane.on('change', (ev) => {
    if ([
        'radius', 'nLat', 'nFrames', 'particleSize', 'particleSizeLand', 'particleSizeOcean', 'rotationSpeed',
        'land', 'ocean', 'background'
    ].some(key => ev.presetKey === key || ev.target?.key === key)) {
        if (configChangeTimeout) {
            clearTimeout(configChangeTimeout);
        }
        configChangeTimeout = setTimeout(() => {
            needsUpdate = true;
            configChangeTimeout = null;
        }, DEBOUNCE_MS);
    }
});

let rotation = 0;

function rotateX([x, y, z], angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        x,
        cos * y - sin * z,
        sin * y + cos * z
    ];
}

function rotateY([x, y, z], angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        cos * x + sin * z,
        y,
        -sin * x + cos * z
    ];
}

function rotateZ([x, y, z], angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        cos * x - sin * y,
        sin * x + cos * y,
        z
    ];
}

function project([x, y, z], width, height, scale = 1) {
    const cx = width / 2;
    const cy = height / 2;
    return [
        cx + x * scale,
        cy - y * scale 
    ];
}

let frmCounter = 0;
let updateScheduled = false;
let updateInProgress = false;
function render() {
    const width = manager.width;
    const height = manager.height;

    if (needsUpdate && !updateScheduled && !updateInProgress) {
        updateScheduled = true;
        needsUpdate = false;
        updateInProgress = true;
        (async () => {
            isLoading = true;
            await initializeEarth();
            isLoading = false;
            updateScheduled = false;
            updateInProgress = false;
        })();
    }

    ctx.fillStyle = globeSettings.colors.background;
    ctx.fillRect(0, 0, width, height);

    if (isLoading && (!particlePositions || particlePositions.length === 0)) {
        ctx.fillStyle = '#ffff00';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading Earth...', width / 2, height / 2);
        requestAnimationFrame(render);
        return;
    }

    rotation += globeSettings.rotationSpeed;
    const scale = Math.min(width, height) * globeSettings.radius * 1.15;

    const tiltAway = 8 * Math.PI / 180;
    const tiltLeft = 16 * Math.PI / 180;

    if (globeSettings.showPoleLine) {
        const pokePx = 120;
        const pokeWorld = pokePx / scale;
        let northPole = [0, 0, globeSettings.radius + pokeWorld];
        let southPole = [0, 0, -globeSettings.radius - pokeWorld];

        northPole = rotateX(northPole, -Math.PI / 2);
        northPole = rotateX(northPole, tiltAway);
        northPole = rotateZ(northPole, tiltLeft);
        northPole = rotateY(northPole, rotation);

        southPole = rotateX(southPole, -Math.PI / 2);
        southPole = rotateX(southPole, tiltAway);
        southPole = rotateZ(southPole, tiltLeft);
        southPole = rotateY(southPole, rotation);

        const [px1, py1] = project(northPole, width, height, scale);
        const [px2, py2] = project(southPole, width, height, scale);
        ctx.save();
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();
        ctx.restore();
    }

    const transformedParticles = [];
    for (const p of particlePositions) {
        let v = [p.x, p.y, p.z];

        v = rotateX(v, -Math.PI / 2);

        v = rotateX(v, tiltAway);
        v = rotateZ(v, tiltLeft);

        v = rotateY(v, rotation);
        transformedParticles.push({
            ...p,
            transformed: v,
            depth: v[2] 
        });
    }

    let lastColor = null;
    let batch = [];
    function flushBatch(color) {
        if (batch.length === 0) return;
        ctx.beginPath();
        for (const { px, py, particleSize } of batch) {
            ctx.moveTo(px + particleSize, py);
            ctx.arc(px, py, particleSize, 0, 2 * Math.PI);
        }
        ctx.fillStyle = color;
        ctx.fill();
        batch = [];
    }
    const XRAY = globeSettings.xray; 
    for (const particle of transformedParticles) {
        const v = particle.transformed;
        if (v[2] > -XRAY) { 
            const [px, py] = project(v, width, height, scale);
            let particleSize = globeSettings.particleSize;
            let fillStyle = globeSettings.colors.background;

            if (particle.isLand) {
                fillStyle = globeSettings.colors.land;
                particleSize = globeSettings.particleSizeLand;
            } else {
                fillStyle = globeSettings.colors.ocean;
                particleSize = globeSettings.particleSizeOcean;
            }

            const distance = Math.abs(v[2]);
            const alpha = Math.max(0.6, 1 - distance * 2);
            if (alpha < 1) {

                const match = fillStyle.match(/rgb\((\d+), (\d+), (\d+)\)/);
                if (match) {
                    fillStyle = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
                }
            }

            if (fillStyle !== lastColor) {
                flushBatch(lastColor);
                lastColor = fillStyle;
            }
            batch.push({ px, py, particleSize });
        }
    }
    flushBatch(lastColor);
    requestAnimationFrame(render);
    frmCounter++;
}

render();