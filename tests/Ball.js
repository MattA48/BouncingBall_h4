import test from 'ava';
import {Ball, EquationsOfMotion} from '../src/Ball'
import sinon from 'sinon';

function test_calc_pos(t, input, expected) {
    let result = EquationsOfMotion.calcPos(input.s0, input.u, input.a, input.t);
    t.is(result, expected);
};

test('EquationOfMotion: pos no offset, no velocity, no acceleration', test_calc_pos, {s0:0, u:0, a: 0, t: 1}, 0);
test('EquationOfMotion: pos no offset, no acceleration',              test_calc_pos, {s0:0, u:1, a: 0, t: 1}, 1);
test('EquationOfMotion: pos offset, no acceleration',                 test_calc_pos, {s0:1, u:1, a: 0, t: 1}, 2);
test('EquationOfMotion: pos no offset, no velocity, acceleration',    test_calc_pos, {s0:0, u:0, a: 10, t: 1}, 5);
test('EquationOfMotion: pos no offset, velocity, acceleration',       test_calc_pos, {s0:0, u:1, a: 10, t: 1}, 6);
test('EquationOfMotion: pos no offset, multi_sec',                    test_calc_pos, {s0:0, u:1, a: 0, t: 10}, 10);
test('EquationOfMotion: pos no offset, acceleration, multi_sec',      test_calc_pos, {s0:0, u:1, a: 10, t: 10}, 510);
test('EquationOfMotion: pos no time',                                 test_calc_pos, {s0:10, u:10, a: 10, t: 0}, 10);

function test_calc_vel(t, input, expected) {
    let result = EquationsOfMotion.calcVelocity(input.u, input.a, input.t);
    t.is(result, expected);
}

test('EquationsOfMotion: velocity no initial, no acceleration', test_calc_vel, {u:0, a: 0, t: 10}, 0);
test('EquationsOfMotion: velocity initial, no acceleration',    test_calc_vel, {u:10, a: 0, t: 10}, 10);
test('EquationsOfMotion: velocity initial, acceleration',       test_calc_vel, {u:10, a: 10, t: 10}, 110);
test('EquationsOfMotion: velocity initial, - acceleration',     test_calc_vel, {u:0, a: -10, t: 10}, -100);
test('EquationsOfMotion: velocity no time',                     test_calc_vel, {u:10, a: 10, t: 0}, 10);

test.afterEach(t=> {
    sinon.restore();
});

test('move calls calcPos for each dimension', t=> {
    let ball = new Ball({x: 1, y: 0}, {x: 1, y: 0});
    let stub = sinon.stub(EquationsOfMotion, 'calcPos');
    ball.move(1, {x: 1, y: 0});
    t.assert(stub.calledTwice);
    t.deepEqual(stub.args[0], [1, 1, 1, 1]);
    t.deepEqual(stub.args[1], [0, 0, 0, 1]);
});

test('move calls calcVelocity for each dimension', t=> {
    let ball = new Ball({x: 1, y: 0}, {x: 1, y: 0});
    let stub = sinon.stub(EquationsOfMotion, 'calcVelocity');
    ball.move(1, {x: 1, y: 0});
    t.assert(stub.calledTwice);
    t.deepEqual(stub.args[0], [1, 1, 1]);
    t.deepEqual(stub.args[1], [0, 0, 1]);
});

function BOUNDS() {
    return{
        top: {dim:0, isHard: false},
        right: {dim:300, isHard: false},
        bottom: {dim:300, isHard: true},
        left: {dim:0, isHard: true}
    }
};

test(
    'Ball bounces off walls', t=> {
        let ball = new Ball({x: -1, y: 50}, {x: -1, y: 50});
        let boundary = BOUNDS();
        ball = ball.enforceBounds(boundary);
        t.deepEqual(ball.pos, {x: 1, y: 50});
    }
);

test(
    'Ball falls off canvas', t=> {
        let ball = new Ball({x: 301, y: 50}, {x: 1, y: 50});
        let boundary = BOUNDS();
        ball = ball.enforceBounds(boundary);
        t.falsy(ball);

    }
);

test(
    'Exceptions raised if ball in invalid area', t=> {
        let ball = new Ball({x: -1, y: 50}, {x: 1, y: 50});
        // should not be moving towards a wall outside the canvas
        let boundary = BOUNDS();
        t.throws(()=>{ball.enforceBounds(boundary), RangeError});
    }
);
