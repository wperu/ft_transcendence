import { Socket } from "socket.io";

export interface PongUser
{
    socket: Socket,
    username: string,
    points: number,
    position: number,
    velocity: number,
    key: number,
}