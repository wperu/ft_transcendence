
/**
 * status 0 join
 * status 1 reconnect
 * status 2 error
 */
export interface RoomJoinedDTO
{
	id: 				number,
	room_name:			string,
	protected:			boolean,
	level:				ELevelInRoom,
	isDm:				boolean,
	owner:				number, // (if is dm owner alway user2)
}

export enum JOINSTATUS
{
	JOIN = 0,
	ERROR = 1,
	CONNECT = 2,
}

export enum ELevelInRoom
{
	casual = 0,
	admin = 1,
	owner = 2,
}