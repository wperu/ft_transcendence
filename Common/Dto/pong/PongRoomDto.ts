
import { PongUserDTO } from "./PongUserDto";

export enum RoomState {
    WAITING, 
    PLAYING,
    FINISHED,
}

export interface PongRoomDTO
{
    player_1: PongUserDTO,
    player_2: PongUserDTO,
    spectators: Array<PongUserDTO>,
    state: RoomState,
}
