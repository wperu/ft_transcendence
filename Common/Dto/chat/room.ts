

export interface RoomProtect
{
    room_name : string,
    private_room: boolean,
    opt?: string
}

export interface CreateRoom
{
	room_name: string,
	private_room: boolean,
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

export interface RoomBanDto
{
	room_name: string,
	user_name: string,
	expires_in: number,
}

export interface RoomLeftDto
{
	status: number,
	status_message?: string,
	room_name?: string,
}

export interface UserDataDto
{
	username: string,
    reference_id: number,
}


// export { create_room, room_protect };
