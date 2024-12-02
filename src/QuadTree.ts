

export class Rect {
    x: number
    y: number
    size: number

    constructor(x: number, y: number, s: number) {
        this.x = x;
        this.y = y;
        this.size = s;
    }

    contains(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.size && y >= this.y && y <= this.y + this.size;
    }

    quadrants(): Rect[] {
        const halfSize = this.size / 2;
        const sw = new Rect(this.x, this.y, halfSize);
        const se = new Rect(this.x + halfSize, this.y, halfSize);
        const nw = new Rect(this.x, this.y + halfSize, halfSize);
        const ne = new Rect(this.x + halfSize, this.y + halfSize, halfSize);

        return [sw, se, nw, ne];
    }

    intersectsCircle(cx: number, cy: number, r: number): boolean {
        // Find the closest point on the rectangle to the circle's center
        const closestX = Math.max(this.x, Math.min(cx, this.x + this.size));
        const closestY = Math.max(this.y, Math.min(cy, this.y + this.size));

        // Calculate the distance from the circle's center to this closest point
        const dx = closestX - cx;
        const dy = closestY - cy;

        // If the distance is less than or equal to the radius, they intersect
        return dx * dx + dy * dy <= r * r;
    }
}

interface IndexedPoint {
    x: number
    y: number
    idx: number
}

export class QuadTree {
    points: IndexedPoint[] = []
    bounds: Rect
    children: QuadTree[] = []
    capacity = 4
    maxDepth = 5
    depth


    constructor(bounds: Rect, depth = 0) {
        this.bounds = bounds;
        this.depth = depth;
    }

    insert(x: number, y: number, idx: number): void {
        if (!this.bounds.contains(x, y)) return;

        if (!this.isLeaf()) {
            for (const q of this.children!) {
                if (!q.bounds.contains(x, y)) continue;

                q.insert(x, y, idx);
                return;
            }
        }

        if (this.points.length < this.capacity || this.depth >= this.maxDepth) {
            this.points.push({ x, y, idx });
            return;
        }

        this.split();
        for (const q of this.children) {
            if (!q.bounds.contains(x, y)) continue;
            q.insert(x, y, idx);
            return;
        }
    }



    query(x: number, y: number, r: number): number[] {
        const result: number[] = [];

        const recursiveQuery = (node: QuadTree) => {
            // Ignore nodes whose bounds do not intersect the circle
            if (!node.bounds.intersectsCircle(x, y, r)) return;

            // If this is a non-empty leaf, add its points to the results
            if (node.isLeaf() && !node.isEmpty()) {
                for (const p of node.points) {
                    const dx = p.x - x;
                    const dy = p.y - y;

                    if (dx * dx + dy * dy <= r * r) {
                        result.push(p.idx);
                    }
                }
                return;
            }

            // If this is not a leaf, recursively query children
            if (!node.isLeaf()) {
                for (const child of node.children) {
                    recursiveQuery(child);
                }
            }
        };

        // Start recursion from the root node
        recursiveQuery(this);

        return result;
    }

    private split(): void {
        const quadrants = this.bounds.quadrants();
        this.children = quadrants.map((q) => new QuadTree(q, this.depth + 1));

        // Reinsert the existing point into the appropriate child
        if (!this.isEmpty()) {
            for (const p of this.points) {
                for (const q of this.children) {
                    if (!q.bounds.contains(p.x, p.y)) continue;
                    q.insert(p.x, p.y, p.idx);
                    break;
                }
            }

        }

        // Reset this node's data
        this.points = [];
    }

    private isEmpty(): boolean {
        return this.points.length === 0;
    }

    private isLeaf(): boolean {
        return this.children.length === 0;
    }
}   