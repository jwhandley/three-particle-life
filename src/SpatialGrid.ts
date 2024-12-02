import { clamp } from "three/src/math/MathUtils.js"


class Cell {
    indices: number[] = [];

    add(idx: number) {
        this.indices.push(idx);
    }

    clear() {
        this.indices = [];
    }
}

export class SpatialGrid {
    x: number
    y: number
    width: number
    height: number
    cellSize: number
    rows: number
    cols: number
    cells: Cell[][]

    constructor(x: number, y: number, width: number, height: number, cellSize: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.rows = Math.ceil(height / cellSize);
        this.cols = Math.ceil(width / cellSize);

        this.cells = Array.from({ length: this.rows }, () =>
            Array.from({ length: this.cols }, () => new Cell())
        );
    }

    insert(x: number, y: number, idx: number): void {
        const [r, c] = this.hash(x, y);
        this.cells[r][c].add(idx);
    }

    query(x: number, y: number): number[] {
        const [row, col] = this.hash(x, y);
        const result = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (row + dy < 0 || row + dy >= this.rows) continue;
                if (col + dx < 0 || col + dx >= this.cols) continue;

                result.push(...this.cells[row + dy][col + dx].indices);
            }
        }

        return result;
    }

    private hash(x: number, y: number): [number, number] {
        const row = clamp(Math.floor((y - this.y) / this.cellSize), 0, this.rows - 1);
        const col = clamp(Math.floor((x - this.x) / this.cellSize), 0, this.cols - 1);
        return [row, col];
    }
}

