
import { Socket } from 'socket.io'

export interface UserData
{
	username: string,
    reference_id: string,
}

export interface ChatUser 
{
    //socketId: string[],
	socket: Socket[],

    username: string,
    reference_id: number,
    room_list: string[],
    /* ... */
}
