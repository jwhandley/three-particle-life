import * as THREE from 'three'
import { ParticleSystem } from './ParticleSystem';
import { params } from './main';

export class ParticleRenderer extends THREE.Points {
    constructor(particleSystem: ParticleSystem, texture: THREE.Texture) {
        const geometry = new THREE.BufferGeometry();

        const colors = new Float32Array(particleSystem.count * 3);

        for (let i = 0; i < particleSystem.count; i++) {
            const type = particleSystem.types[i];
            const color = new THREE.Color().setHSL(type / params.colorCount, 0.7, 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(particleSystem.positions, 2).setUsage(THREE.DynamicDrawUsage)
        );

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: params.size,
            vertexColors: true,
            transparent: true,
            map: texture,
        });

        super(geometry, material);
        particleSystem.addEventListener("update" as never, () => this.update())
    }

    update() {
        this.geometry.attributes.position.needsUpdate = true;
    }

    setScale(zoom: number) {
        (this.material as THREE.PointsMaterial).size = params.size * zoom;
    }
}