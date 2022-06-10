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
    in_game: string | undefined,
	in_room: string | undefined,
}