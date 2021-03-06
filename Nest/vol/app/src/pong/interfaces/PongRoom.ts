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
    ball2?: PongBall,
    spectators: Array<PongUser>,
    state: RoomState,
    reconnectTimeout: NodeJS.Timeout,
    
    frameCount: number,
    deltaTime: number,
    lastTime: number,
    currentTime: number,
    
    custom: boolean,
    options: number, // use binary or ( | ) to chain options
	withdrawal: number, // 0 for none or 1 for player 1 or 2 for player 2 or 3 for both withdrew

    endScore: number,
}

export enum RoomOptions
{
	DEFAULT,
	DOUBLE_BALL,
}