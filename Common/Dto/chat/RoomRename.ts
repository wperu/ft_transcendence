export interface RoomRename
{
    old_name: string,
    new_name: string
}

export interface RoomChangePass
{
    room_name: string,
    new_pass: string
}

export interface RoomPassChange
{
	status: number,
	room_name: string,
	status_message?: string,
}

// export {RoomRename,RoomChangePass};