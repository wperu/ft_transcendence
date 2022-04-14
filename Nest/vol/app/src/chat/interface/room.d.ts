import { Socket } from "socket.io";

interface room
{
    name: string,
	protection: RoomProtection,
	owner: Socket,
	users: Array<Socket>
	invited : Array<string>,
	muted : Array<string>,
	banned : Array<string>,
	password?: string,
}

export {room};