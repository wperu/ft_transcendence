
enum RoomProtection {
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


export interface RoomPromoteDto
{
	room_name: string,
	user_name: string,
	isPromote: boolean,
}

export interface RoomMuteDto
{
	room_name: string,
	user_name: string,
}

export interface RoomLeftDto
{
	status: number,
	status_message?: string,
	room_name?: string,
}


export { RoomProtection };

// export { create_room, room_protect };
