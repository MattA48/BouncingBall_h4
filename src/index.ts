

import BallController from "./BallController";
import settings from "./Settings";
import { BallFactory } from "./Ball";

function init() {

    // create the canvas here rather than in HTML. Dimensions and borders are needed for calculations and they can either be here in JS and set on DOM
    // or set on DOM and read into JS. At least here it's in one place
    let root = document.documentElement;
    let bounds = settings.BOUNDS;
    root.style.setProperty('--border-top', bounds.top.isHard ? 'solid' : 'none');
    root.style.setProperty('--border-right', bounds.right.isHard ? 'solid' : 'none');
    root.style.setProperty('--border-bottom', bounds.bottom.isHard ? 'solid' : 'none');
    root.style.setProperty('--border-left', bounds.left.isHard ? 'solid' : 'none');
   
    let height = bounds.bottom.dim - bounds.top.dim;
    let width = bounds.right.dim - bounds.left.dim;
    document.body.innerHTML += `<canvas id="canvas" width=${width} height=${height} top=${bounds.top.dim} left=${bounds.left.dim}/>`

    // kick off the code - creating the controller also adds the click event (easier to deal with scope) and sets off the animation loop
    let ballController = new BallController(<HTMLCanvasElement>document.getElementById('canvas'), bounds, new BallFactory, window);
    ballController.animateCanvas();
}

init();