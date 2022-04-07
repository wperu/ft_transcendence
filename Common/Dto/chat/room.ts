
export enum RoomProtection {
	NONE,
	PROTECTED,
	PRIVATE,
}

export interface room_protect
{
    room_name : string,
    protection_mode: RoomProtection,
    opt?: string
}

export interface create_room
{
	room_name: string,
	proctection: RoomProtection,
	password?: string
}


//export { RoomProtection };

// export { create_room, room_protect };
