
import { Socket } from 'socket.io'
import { UserDataDto } from 'src/Common/Dto/chat/room';

export interface UserData extends UserDataDto {};

/**
 * Object to limit spam invite
 */
export interface InviteControler
{
	id: string,
	users?: {refId : number, date: Date}[],
}


/**
 * User interface to ChatGateway
 */
export interface ChatUser 
{
    //socketId: string[],
	socket: Socket[];

    username: string;
    reference_id: number;

	gameInvite?: InviteControler;
    /* ... */
}
