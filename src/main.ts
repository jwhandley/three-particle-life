import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { randFloat } from 'three/src/math/MathUtils.js';
import Stats from 'three/addons/libs/stats.module.js';
import { ParticleSystem } from './ParticleSystem';
import { ParticleRenderer } from './ParticleRenderer';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export let attractionMatrix: number[][];

export const params = {
    size: 5,
    beta: 0.3,
    maxRadius: 100,
    forceMultiplier: 5,
    velocityDecay: 15,
    colorCount: 5,
    particleCount: 5000,
    randomizePositions: () => {
        scene.clear();
        particleSystem = new ParticleSystem(params.particleCount, window.innerWidth, window.innerHeight);
        particleRenderer = new ParticleRenderer(particleSystem, pointTexture);
        scene.add(particleRenderer);
    },
    randomizeMatrix: () => {
        attractionMatrix = [];
        for (let i = 0; i < params.colorCount; i++) {
            attractionMatrix.push([]);
            for (let j = 0; j < params.colorCount; j++) {
                attractionMatrix[i].push(randFloat(-1, 1));
            }
        }
    },
    reset: () => {
        setup();
    }
};

let particleSystem: ParticleSystem;
let particleRenderer: ParticleRenderer;

const gui = new GUI();
gui.add(params, 'beta', 0, 1).step(0.01).name("Beta");
gui.add(params, 'maxRadius', 0, 200).step(1).name("Max Radius");
gui.add(params, 'forceMultiplier', 1, 10).step(0.1).name("Force multiplier");
gui.add(params, 'velocityDecay', 0, 50).step(1).name("Velocity decay");
gui.add(params, 'particleCount', 1000, 10000).step(100).name("Particle count").onChange((v) => {
    params.particleCount = v;
    params.reset();
})
gui.add(params, 'colorCount', 1, 10).step(1).name("Color count").onChange((v) => {
    params.colorCount = v;
    params.reset();
})
gui.add(params, 'reset').name("Reset simulation");
gui.add(params, 'randomizeMatrix').name("Randomize matrix");
gui.add(params, 'randomizePositions').name("Randomize positions");


gui.title("Simulation parameters");


function setup() {
    attractionMatrix = new Array<Array<number>>();
    for (let i = 0; i < params.colorCount; i++) {
        attractionMatrix.push([]);
        for (let j = 0; j < params.colorCount; j++) {
            attractionMatrix[i].push(randFloat(-1, 1));
        }
    }
    scene.clear();
    particleSystem = new ParticleSystem(params.particleCount, window.innerWidth * 2, window.innerHeight * 2);
    particleRenderer = new ParticleRenderer(particleSystem, pointTexture);
    scene.add(particleRenderer);
}


const pointTexture = new THREE.TextureLoader().load("./particle_texture_white.png");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181818);


const camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, -10, 10000);
camera.position.z = 20;

const controls = new MapControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.enableRotate = false;
controls.minZoom = 1 / 1.5;

setup();

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    controls.update();
    stats.update();
    particleSystem.update(clock.getDelta(), attractionMatrix);
});

controls.addEventListener("change", () => particleRenderer.setScale(camera.zoom));

window.onresize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.left = -window.innerWidth / 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = -window.innerHeight / 2;
    camera.updateProjectionMatrix();
};


