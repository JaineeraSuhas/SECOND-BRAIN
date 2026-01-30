/**
 * Performance monitoring utilities for the 3D graph
 */

export class PerformanceMonitor {
    private fpsHistory: number[] = [];
    private lastFrameTime: number = performance.now();
    private frameCount: number = 0;
    private maxHistorySize: number = 60;

    /**
     * Update FPS calculation
     */
    update(): number {
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        const fps = 1000 / delta;

        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxHistorySize) {
            this.fpsHistory.shift();
        }

        this.lastFrameTime = now;
        this.frameCount++;

        return fps;
    }

    /**
     * Get average FPS
     */
    getAverageFPS(): number {
        if (this.fpsHistory.length === 0) return 0;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    /**
     * Get current FPS
     */
    getCurrentFPS(): number {
        if (this.fpsHistory.length === 0) return 0;
        return Math.round(this.fpsHistory[this.fpsHistory.length - 1]);
    }

    /**
     * Get min/max FPS
     */
    getStats(): { min: number; max: number; avg: number; current: number } {
        if (this.fpsHistory.length === 0) {
            return { min: 0, max: 0, avg: 0, current: 0 };
        }

        return {
            min: Math.round(Math.min(...this.fpsHistory)),
            max: Math.round(Math.max(...this.fpsHistory)),
            avg: this.getAverageFPS(),
            current: this.getCurrentFPS()
        };
    }

    /**
     * Reset monitoring
     */
    reset(): void {
        this.fpsHistory = [];
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
    }
}

/**
 * Level of Detail (LOD) system for graph rendering
 */
export class LODSystem {
    private nodeCount: number = 0;
    private currentLOD: 'high' | 'medium' | 'low' = 'high';

    /**
     * Determine LOD level based on node count
     */
    determineLOD(nodeCount: number): 'high' | 'medium' | 'low' {
        this.nodeCount = nodeCount;

        if (nodeCount < 100) {
            this.currentLOD = 'high';
        } else if (nodeCount < 1000) {
            this.currentLOD = 'medium';
        } else {
            this.currentLOD = 'low';
        }

        return this.currentLOD;
    }

    /**
     * Get rendering settings for current LOD
     */
    getRenderSettings(): {
        nodeRelSize: number;
        linkWidth: number;
        particleCount: number;
        showLabels: boolean;
        enableBloom: boolean;
    } {
        switch (this.currentLOD) {
            case 'high':
                return {
                    nodeRelSize: 4,
                    linkWidth: 1.5,
                    particleCount: 100,
                    showLabels: true,
                    enableBloom: true
                };
            case 'medium':
                return {
                    nodeRelSize: 3,
                    linkWidth: 1.0,
                    particleCount: 50,
                    showLabels: true,
                    enableBloom: false
                };
            case 'low':
                return {
                    nodeRelSize: 2,
                    linkWidth: 0.5,
                    particleCount: 0,
                    showLabels: false,
                    enableBloom: false
                };
        }
    }

    /**
     * Get current LOD level
     */
    getCurrentLOD(): 'high' | 'medium' | 'low' {
        return this.currentLOD;
    }

    /**
     * Should render node based on distance from camera
     */
    shouldRenderNode(distance: number): boolean {
        const maxDistance = {
            high: Infinity,
            medium: 500,
            low: 300
        };

        return distance <= maxDistance[this.currentLOD];
    }
}

/**
 * Frustum culling for off-screen nodes
 */
export class FrustumCuller {
    private camera: any;
    private _frustum: any;

    constructor() {
        // Will be initialized with Three.js camera
    }

    /**
     * Set camera for frustum calculation
     */
    setCamera(camera: any): void {
        this.camera = camera;
    }

    /**
     * Check if node is in view frustum
     */
    isInFrustum(nodePosition: { x: number; y: number; z: number }): boolean {
        if (!this.camera) return true; // Render all if no camera set

        // Simple distance-based culling for now
        // TODO: Implement proper frustum culling with Three.js Frustum class
        const cameraPos = this.camera.position;
        const distance = Math.sqrt(
            Math.pow(nodePosition.x - cameraPos.x, 2) +
            Math.pow(nodePosition.y - cameraPos.y, 2) +
            Math.pow(nodePosition.z - cameraPos.z, 2)
        );

        return distance < 1000; // Cull nodes beyond 1000 units
    }

    /**
     * Filter nodes based on frustum
     */
    filterNodes(nodes: any[]): any[] {
        return nodes.filter(node => {
            if (!node.x || !node.y || !node.z) return true; // Keep unpositioned nodes
            return this.isInFrustum({ x: node.x, y: node.y, z: node.z });
        });
    }
}

/**
 * Graph physics optimization
 */
export class PhysicsOptimizer {
    /**
     * Get optimized force simulation settings
     */
    getForceSettings(nodeCount: number): {
        cooldownTicks: number;
        cooldownTime: number;
        warmupTicks: number;
        d3AlphaDecay: number;
        d3VelocityDecay: number;
    } {
        if (nodeCount < 50) {
            return {
                cooldownTicks: 100,
                cooldownTime: 15000,
                warmupTicks: 0,
                d3AlphaDecay: 0.0228,
                d3VelocityDecay: 0.4
            };
        } else if (nodeCount < 500) {
            return {
                cooldownTicks: 200,
                cooldownTime: 10000,
                warmupTicks: 100,
                d3AlphaDecay: 0.05,
                d3VelocityDecay: 0.6
            };
        } else {
            return {
                cooldownTicks: 300,
                cooldownTime: 5000,
                warmupTicks: 50,
                d3AlphaDecay: 0.1,
                d3VelocityDecay: 0.8
            };
        }
    }

    /**
     * Calculate optimal link distance
     */
    getLinkDistance(nodeCount: number): number {
        if (nodeCount < 50) return 30;
        if (nodeCount < 500) return 50;
        return 80;
    }

    /**
     * Calculate charge strength
     */
    getChargeStrength(nodeCount: number): number {
        if (nodeCount < 50) return -30;
        if (nodeCount < 500) return -50;
        return -100;
    }
}

export const performanceMonitor = new PerformanceMonitor();
export const lodSystem = new LODSystem();
export const frustumCuller = new FrustumCuller();
export const physicsOptimizer = new PhysicsOptimizer();
