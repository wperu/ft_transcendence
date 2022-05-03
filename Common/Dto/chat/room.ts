

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
	isPromote: boolean, // true = promote; false = demote
}

export interface RoomMuteDto
{
	room_name: string,
	user_name: string,
	isMute: boolean // true = mute; false = unmute
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
	is_connected?: boolean,
}


export interface RcvMessageDto
{
	message: string,
	sender: string,
	refId: number,
	send_date: string,
	room_name: string
};

export interface RoomListDTO
{
	id:				number;
	name:			string;
	owner:			number; //refId
	has_password:	boolean;
}



// export { create_room, room_protect };
