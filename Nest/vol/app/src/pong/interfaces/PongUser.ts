import { Socket } from "socket.io";

export interface PongUser
{
    socket: Socket,
    username: string,
    reference_id: number,
    points: number,
    position: number,
    velocity: number,
    key: number,
    in_game: boolean,
	in_room: string | undefined,
}