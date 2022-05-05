import { ELevelInRoom } from "./RoomJoined"


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
	room_id:	number,
	refId:		number,
	isPromote:	boolean, // true = promote; false = demote
}

export interface RoomMuteDto
{
	roomId:		number,
	refId:		number,
	expires_in:	number,
	isMute:		boolean, // true = mute; false = unmute
}

export interface RoomBanDto
{
	room_name: string,
	user_name: string,
	expires_in: number,
}

export interface RoomLeftDto
{
	id:			number,
	room_name:	string,
}

export interface UserDataDto
{
	username: string,
    reference_id: number,
	is_connected?: boolean,
}

export interface UserRoomDataDto
{
	username:		string,
    reference_id:	number,
	is_connected?:	boolean,
	isMuted:		boolean,
	level:			ELevelInRoom,
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

export interface RoomUpdataDTO
{
	id:			number,
	level?:		ELevelInRoom,
	name?:		string,
	isPrivate?: boolean,
	isAdmin:	boolean,
}

