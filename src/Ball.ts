import {Vector_2D, CanvasBounds, Boundary, PosVelocity_1D, IBall, IBallFactory} from "./Struct"
import settings from "./Settings";

export class BallFactory implements IBallFactory{
    createAt(x: number, y: number): IBall {
        return new Ball({x: x, y: y});
    }
}

export class EquationsOfMotion {
    // s = ut + .5at*t - takes a starting position (s0) rather than just calculating the distance moved
    static calcPos = (s0: number, u: number, a: number, t: number) : number => s0 + ((u * t) + (0.5 * a * t * t));
    // v = u + at
    static calcVelocity = (u: number, a: number, t:number): number => u + (a * t); 
}

export class Ball implements IBall {
    public pos: Vector_2D;
    public velocity: Vector_2D;
    public radius: number;
    constructor(pos: Vector_2D, velocity?: Vector_2D) {
        // new ball. Pos defined by click location, velocity can be set or randomly assigned based on MAX_VELOCITY_PER_DIMENSION
        this.pos = pos;
        let max_vel = settings.MAX_VELOCITY_PER_DIMENSION;
        this.velocity = velocity ? velocity : {x: this.randomBetween(-max_vel,max_vel), 
                                               y: this.randomBetween(-max_vel,max_vel)};
        this.radius = settings.BALL_RADIUS;
        }
        
    randomBetween(min:number, max:number):number {
        // only used to calculate random ball speed between - and +, would usually come from a library
        return Math.random() * (max - min + 1) + min;
    };
    enforceBounds1D (min: Boundary, max: Boundary, ballData: PosVelocity_1D):PosVelocity_1D {
        // each dimension can be handled separately, so this is called 2x rather than duplicated code
        // check the ball position vs dimensions of the canvas and 'bounce' it off a wall or remove it if it falls off
        if (min.dim >= max.dim) {throw new RangeError('enforceBounds1D: min is greater than max')}
        while(ballData.pos < min.dim || ballData.pos > max.dim) {
            // testing the min dimension (top or left)
            // in theory, a ball could hit opposing walls multiple times in a time period, hence while
            if (ballData.pos < min.dim) {
                if (ballData.vel >= 0) {throw new RangeError("Error - velocity +ve when below min bound")}
                if (min.isHard) {
                    // ball has hit a wall - calculate how far it passed through it, and set this as it's new distance from the wall
                    // really ought to consider ball radius in this calc, as this only bounces when the centre hits the wall
                    let overshoot = min.dim - ballData.pos;
                    ballData.pos = min.dim + overshoot;
                    // also need to flip velocity in this dimension
                    ballData.vel = -ballData.vel;
                } else {
                    // ball has fallen off the canvas - remove it from the pool by returning undefined
                    return undefined;
                }
            }

            // testing the max dimension (bottom/right)
            if (ballData.pos > max.dim) {
                if (ballData.vel <= 0) {throw("Error - velocity -ve when above max bound")}
                if (max.isHard) {
                    let overshoot =  ballData.pos - max.dim;
                    ballData.pos = max.dim - overshoot;
                    ballData.vel = -ballData.vel;
                } else {
                    return undefined;
                }
            }            
        }
        return ballData;
    }
    move (timeElapsed: number, gravity: Vector_2D): IBall {
        // move the ball using the equations of motion - each dimension is independent and velocity and position calculated independently
        let newPosVector = {
            x: EquationsOfMotion.calcPos(this.pos.x, this.velocity.x, gravity.x, timeElapsed),
            y: EquationsOfMotion.calcPos(this.pos.y, this.velocity.y, gravity.y, timeElapsed)
        }

        let newVelocityVector = {
            x: EquationsOfMotion.calcVelocity(this.velocity.x, gravity.x, timeElapsed),
            y: EquationsOfMotion.calcVelocity(this.velocity.y, gravity.y, timeElapsed),
        }
        this.pos = newPosVector;
        this.velocity = newVelocityVector;
        return this;
    };


    enforceBounds (boundaries: CanvasBounds): IBall {
        // if a ball has 'passed' the edge of a canvas, either bounce it by flipping it's velocity and adjusting position by overshoot or
        // remove it from the pool (return undefined)
        let x_dim = this.enforceBounds1D(boundaries.left, boundaries.right, {pos: this.pos.x, vel: this.velocity.x});
        let y_dim = this.enforceBounds1D(boundaries.top, boundaries.bottom, {pos: this.pos.y, vel: this.velocity.y});
        if (x_dim && y_dim) {
            this.pos = {x: x_dim.pos, y: y_dim.pos};
            this.velocity = {x: x_dim.vel, y: y_dim.vel};
            return this;
        } else {
            // either dimension has fallen off (is undefined)
            return undefined;
        }
    }

    draw (destCanvas: CanvasRenderingContext2D) {
        // draw a circle on canvas to represent the ball position
        destCanvas.beginPath();
        destCanvas.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, true);
        destCanvas.stroke();
    };
}