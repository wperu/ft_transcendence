
import { Socket } from 'socket.io'

export interface ChatUser 
{
    socket: Socket,

    username: string,
    reference_id: string,

    /* ... */
}
