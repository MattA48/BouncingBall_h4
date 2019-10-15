import test from 'ava';
import BallController from '../src/BallController';
import { BallFactory } from '../src/Ball';
import sinon from 'sinon';

function BOUNDS() {
    return{
        top: {dim:0, isHard: false},
        right: {dim:300, isHard: false},
        bottom: {dim:300, isHard: true},
        left: {dim:0, isHard: true}
    }
};

test.beforeEach(t=> {
    let ballFactory = new BallFactory;
    let elementStub = {addEventListener: sinon.stub()};
    let ballController = new BallController(elementStub, BOUNDS(), ballFactory, null);
    sinon.stub(ballController,'clearCanvas');
    sinon.stub(ballController,'getCanvasContext');
    t.context = {
        ballFactory,
        ballController
    }
})

test.afterEach(t=> {
    sinon.restore();
});

test(
    'Balls are added via factory', t=>{
        let spy = sinon.spy(t.context.ballFactory);
        t.context.ballController.addBallOnClick({clientX: 1, clientY: 1});
        t.is(spy.calledOnce);
        t.is(t.context.ballController.ballArray.length, 1);
    }
);
function addBallsToController(BC) {
    BC.addBallOnClick({clientX: 1, clientY: 1});
    BC.addBallOnClick({clientX: 2, clientY: 2});
    BC.addBallOnClick({clientX: 3, clientY: 3});
}

test(
    'Each ball has move call per frame', t=>{
        let BC = t.context.ballController;
        addBallsToController(BC);
        let spies = BC.ballArray.map(ball=> sinon.spy(ball, 'move'));
        let stubs = BC.ballArray.map(ball=> sinon.stub(ball, 'draw'));
        BC.drawLoop(true);
        t.assert(spies.every(spy=>spy.calledOnce));
        BC.drawLoop(true);
        t.assert(spies.every(spy=>spy.calledTwice));
    }
);

test(
    'Each ball has boundary call per frame', t=>{
        let BC = t.context.ballController;
        addBallsToController(BC);
        let spies = BC.ballArray.map(ball=> sinon.spy(ball, 'enforceBounds'));
        let stubs = BC.ballArray.map(ball=> sinon.stub(ball, 'draw'));
        BC.drawLoop(true);
        t.true(spies.every(spy=>spy.calledOnce));
        BC.drawLoop(true);
        t.true(spies.every(spy=>spy.calledTwice));
    }
);

test(
    'Balls are removed from canvas', t=>{
        let BC = t.context.ballController;
        addBallsToController(BC);
        // set first ball off-canvas
        let ball = BC.ballArray[0];
        ball.pos = {x: 400, y: 50};
        ball.velocity = {x: 1, y: 0};
        t.is(BC.ballArray.length, 3);
        let stubs = BC.ballArray.map(ball=> sinon.stub(ball, 'draw'));
        BC.drawLoop(true);
        t.is(BC.ballArray.length, 2);
    }
);

