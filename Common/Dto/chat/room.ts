import { Socket } from "socket.io";



enum RoomProtection {
	NONE,
	PROTECTED,
	PRIVATE,
}

interface room_protect
{
    room_name : string,
    protection_mode: RoomProtection,
    opt?: string
}

interface create_room
{
	room_name: string,
	proctection: RoomProtection,
	password?: string
}

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

export {room,create_room,room_protect};
