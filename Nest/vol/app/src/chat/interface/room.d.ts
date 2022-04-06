import { Socket } from "socket.io";
import { RoomProtection } from '../../../../Common/Dto/chat/room';

interface room
{
    name: string,
	protection: RoomProtection,
	owner: Socket,
	users: Array<Socket>
	invited : Array<string>,
	muted : Array<string>,
	password?: string
}

export {room};