import * as THREE from 'three'
import { randFloat, randInt } from 'three/src/math/MathUtils.js';
import { params } from './main';
import { QuadTree, Rect } from './QuadTree';

export class ParticleSystem extends THREE.EventDispatcher {
    count: number;
    width: number;
    height: number;
    positions: Float32Array;
    velocities: Float32Array;
    types: Uint8Array;

    constructor(count: number, width: number, height: number) {
        super();
        this.count = count;
        this.width = width;
        this.height = height;
        this.positions = new Float32Array(count * 2);
        this.velocities = new Float32Array(count * 2);
        this.types = new Uint8Array(count);

        for (let i = 0; i < count; i++) {
            this.positions[i * 2] = randFloat(-width / 2, width / 2);
            this.positions[i * 2 + 1] = randFloat(-height / 2, height / 2);

            this.velocities[i * 2] = 0;
            this.velocities[i * 2 + 1] = 0;
            this.types[i] = randInt(0, params.colorCount - 1);
        }
    }

    computeBounds(): Rect {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < this.count; i++) {
            minX = Math.min(minX, this.positions[i * 2]);
            maxX = Math.max(maxX, this.positions[i * 2]);
            minY = Math.min(minY, this.positions[i * 2 + 1]);
            maxY = Math.max(maxY, this.positions[i * 2 + 1]);
        }

        return new Rect(minX, minY, Math.max(maxX - minX, maxY - minY));
    }

    update(dt: number, attractionMatrix: number[][]) {
        const qt = new QuadTree(this.computeBounds());
        for (let i = 0; i < this.count; i++) {
            qt.insert(this.positions[i * 2], this.positions[i * 2 + 1], i);
        }

        for (let i = 0; i < this.count; i++) {
            let totalForceX = 0, totalForceY = 0;

            for (const j of qt.query(this.positions[i * 2], this.positions[i * 2 + 1], params.maxRadius)) {
                if (i === j) continue;

                const dx = this.positions[j * 2] - this.positions[i * 2];
                const dy = this.positions[j * 2 + 1] - this.positions[i * 2 + 1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 0.01 || dist > params.maxRadius) continue;

                const f = this.force(dist / params.maxRadius, attractionMatrix[this.types[i]][this.types[j]]);
                totalForceX += f * dx / dist;
                totalForceY += f * dy / dist;
            }

            totalForceX *= params.maxRadius * params.forceMultiplier;
            totalForceY *= params.maxRadius * params.forceMultiplier;


            this.velocities[i * 2] *= Math.exp(-params.velocityDecay * dt);
            this.velocities[i * 2 + 1] *= Math.exp(-params.velocityDecay * dt);

            this.velocities[i * 2] += totalForceX * dt;
            this.velocities[i * 2 + 1] += totalForceY * dt;
        }

        for (let i = 0; i < this.count; i++) {
            this.positions[i * 2] += this.velocities[i * 2] * dt;
            this.positions[i * 2 + 1] += this.velocities[i * 2 + 1] * dt;

            const r = Math.pow(this.positions[i * 2], 2) + Math.pow(this.positions[i * 2 + 1], 2);
            if (r > this.width * this.height) {
                this.positions[i * 2] = randFloat(-this.width / 2, this.width / 2);
                this.positions[i * 2 + 1] = randFloat(-this.height / 2, this.height / 2);
                this.velocities[i * 2] = 0;
                this.velocities[i * 2 + 1] = 0;
            }
        }

        this.dispatchEvent({ type: "update" } as never)
    }

    private force(r: number, a: number): number {
        if (r < params.beta) return r / params.beta - 1;
        if (r >= params.beta && r < 1) return a * (1 - Math.abs(2 * r - 1 - params.beta) / (1 - params.beta));
        return 0;
    }
}