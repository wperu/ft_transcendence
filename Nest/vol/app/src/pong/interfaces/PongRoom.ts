import { PongUser } from "./PongUser"
import { PongBall } from "./PongBall"
import { Socket } from "socket.io"

export enum RoomState
{
    WAITING, 
    PLAYING,
    FINISHED,
    PAUSED,
}

export interface PongRoom
{
    id: string,
    job_id: string,
    
    player_1: PongUser,
    player_2: PongUser,
    ball: PongBall,
    spectators: Array<PongUser>,
    state: RoomState,

    frameCount: number,
    deltaTime: number,
    lastTime: number,
    currentTime: number,

    endScore: number,
}
