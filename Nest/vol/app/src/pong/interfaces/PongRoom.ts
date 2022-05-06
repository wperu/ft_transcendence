import { PongUser } from "./PongUser"
import { PongBall } from "./PongBall"

export enum RoomState
{
    WAITING, 
    PLAYING,
    FINISHED,
}

export interface PongRoom
{
    room_id: number,
    player_1: PongUser,
    player_2: PongUser,
    ball: PongBall,
    spectators: Array<PongUser>,
    state: RoomState,
    interval?: NodeJS.Timer,
}

