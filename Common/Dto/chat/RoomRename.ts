export interface RoomRename
{
    id:			number;
    new_name:	string;
}

export interface RoomChangePassDTO
{
    id:			number,
    new_pass:	string
}

export interface RoomPassChange
{
	status: number,
	room_name: string,
	status_message?: string,
}

// export {RoomRename,RoomChangePass};