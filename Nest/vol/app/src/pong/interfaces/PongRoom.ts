import { PongUser } from "./PongUser"
import { RoomState } from "src/Common/Dto/pong/PongRoomDto"

export interface PongRoom
{
    player_1: PongUser,
    player_2: PongUser,
    spectators: Array<PongUser>,
    state: RoomState
}

