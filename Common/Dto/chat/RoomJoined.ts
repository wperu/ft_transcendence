
/**
 * status 0 join
 * status 1 reconnect
 * status 2 error
 */
export interface RoomJoinedDTO
{
	id: 				number,
	status:				number,
	room_name:			string,
	protected:			boolean,
	level:				ELevelInRoom,
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