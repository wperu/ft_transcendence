
/**
 * status 0 join
 * status 1 reconnect
 * status 2 error
 */
export interface RoomJoinedDTO
{
	id?: 				number,
	status:				number,
	status_message?:	string,
	room_name?:			string,
	protected?:			boolean,
	user_is_owner?:		boolean,
}

export enum JOINSTATUS
{
	JOIN = 0,
	ERROR = 1,
	CONNECT = 2,
}