import {IBall, CanvasBounds, IBallFactory}from "./Struct"
import settings from "./Settings";

export default class BallController {
    ballArray: IBall[];
    lastLoopTime: Date;
    canvas: HTMLCanvasElement;
    canvasBounds: CanvasBounds;
    ballFactory: IBallFactory;
    windowObj: Window;

    constructor(element: HTMLCanvasElement, canvasBounds: CanvasBounds, factory: IBallFactory, windowObj: Window) {
        this.lastLoopTime = new Date();
        this.canvas = element;
        this.ballArray = [];
        this.canvasBounds = canvasBounds;
        this.ballFactory = factory;
        this.windowObj = windowObj;
        // how to add new balls - this is easier to handle scope as e comes from Window
        element.addEventListener('click', (e:MouseEvent) => this.addBallOnClick(e));
    }

    animateCanvas () {
        // kick off animation loop
        this.windowObj.requestAnimationFrame(() => this.drawLoop(false));
    }

    updateBallPositions (timeElapsed: number, ballArray: IBall[]): IBall[] {

        ballArray = ballArray.map((val: IBall) => {
            // move all balls according to velocity, acceleration
            let ball = val.move(timeElapsed, settings.GRAVITY);
                
            // handle balls going off-screen or hitting a wall
            ball = ball.enforceBounds(this.canvasBounds);

            // ball in either new position or removed (undefined)
            return ball;
        });

        // remove blanks caused by removed balls
        ballArray = ballArray.filter((val: IBall) => {
            return (!!val);
        });

        return ballArray;
    }
    getCanvasContext (): CanvasRenderingContext2D {
        return this.canvas.getContext('2d');
    }
    clearCanvas (context:CanvasRenderingContext2D): void {
        context.clearRect(
            this.canvasBounds.left.dim,
            this.canvasBounds.top.dim,
            this.canvasBounds.right.dim - this.canvasBounds.left.dim,
            this.canvasBounds.bottom.dim - this.canvasBounds.top.dim
        );
    }
    drawLoop (single: boolean) {      
        // the routine called by RequestAnimationFrame to calculate and redraw all balls for the next animation frame  
        let now = new Date();
        let msElapsed = now.valueOf() - this.lastLoopTime.valueOf();
        this.lastLoopTime = now;

        // move the balls based on timeelapsed
        this.ballArray = this.updateBallPositions(msElapsed/1000, this.ballArray);

        // draw
        let context = this.getCanvasContext();
        this.clearCanvas(context);
        this.ballArray.forEach(ball => ball.draw(context));

        // call for the next loop - single for testing purposes
        if (!single) {
            this.animateCanvas();
        }
    }

    addBallOnClick(e:MouseEvent) {
        this.ballArray.push(this.ballFactory.createAt(e.clientX, e.clientY));
    }
}