
const GameConfig =
{
    BALL_SIZE: 0.05,
    BALL_SPEED: 1.1,
    PLAYER_SIZE: 0.25,
    PLAYER_SPEED: 0.9,
    PLAYER_FRICTION: 0.5,
    PLAYER_FRICTION_ON_ICE: 0.93,
    PLAYER_SWEEP_FORCE: 0.47,
    TERRAIN_PADDING_X: 0.05,
    TERRAIN_PADDING_Y: 0.11, // 0.13
    RELOAD_TIME: 1000,
	DEFAULT_MAX_SCORE: 11,
}

const RoomOptions = {
    DEFAULT: 0b00,
    DOUBLE_BALL: 0b01,
    ICE_FRICTION: 0b10,
};

export { GameConfig, RoomOptions } 
