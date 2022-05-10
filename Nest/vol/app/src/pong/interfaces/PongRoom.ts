import { PongUser } from "./PongUser"
import { PongBall } from "./PongBall"
import { Socket } from "socket.io"

export enum RoomState
{
    WAITING, 
    PLAYING,
    FINISHED,
}

export interface PongRoom
{
    id: number,
    player_1: PongUser,
    player_2: PongUser,
    ball: PongBall,
    spectators: Array<PongUser>,
    state: RoomState,
    interval?: NodeJS.Timer,
}

Socket

