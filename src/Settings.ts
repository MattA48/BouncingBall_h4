import * as structs from './Struct';

export default class Settings {
    public static GRAVITY: structs.Vector_2D = {x: 0, y:9.8};
    public static BALL_RADIUS: number = 3;
    public static MAX_VELOCITY_PER_DIMENSION: number = 50;
    public static BOUNDS: structs.CanvasBounds = {
        top: {dim:0, isHard: false},
        right: {dim:300, isHard: false},
        bottom: {dim:300, isHard: true},
        left: {dim:0, isHard: false}
    }
}
