export interface RoomJoined
{
	status: number,
	status_message?: string,
	room_name?: string,
	protected?: boolean,
	user_is_owner?: boolean,
}