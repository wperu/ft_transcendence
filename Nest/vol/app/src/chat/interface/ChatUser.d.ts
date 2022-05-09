
import { Socket } from 'socket.io'
import { UserDataDto } from 'src/Common/Dto/chat/room';

export interface UserData extends UserDataDto {};


export interface ChatUser 
{
    //socketId: string[],
	socket: Socket[],

    username: string,
    reference_id: number,
    /* ... */
}
