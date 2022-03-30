import { Socket } from "socket.io"


enum RoomProtection {
	NONE,
	PROTECTED,
	PRIVATE,
}

interface room
{
    name: string,
	protection: RoomProtection,
	owner: Socket,
	users: Array<Socket>
	invited : Array<string>,
	password?: string
}

export default room;