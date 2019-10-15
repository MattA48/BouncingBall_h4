
export interface Vector_2D {
    x: number,
    y: number
}

export interface PosVelocity_1D {
    pos: number,
    vel: number
}

export interface Boundary {
    dim: number;
    isHard: boolean; // whether balls bounce off or fall off
}

export interface CanvasBounds {
    top: Boundary;
    right: Boundary;
    bottom: Boundary;
    left: Boundary;
}

export interface IBall {
    pos: Vector_2D,
    velocity: Vector_2D,
    move(timeElapsed: number, gravity: Vector_2D): IBall,
    draw(destCanvas: CanvasRenderingContext2D ): void,
    enforceBounds(boundaries: CanvasBounds): IBall
}

export interface IBallFactory {
    createAt(x: number, y: number): IBall;
}