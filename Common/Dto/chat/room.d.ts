
export enum RoomProtection {
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



export { create_room, room_protect };
