interface room_rename
{
    old_name: string,
    new_name: string
}

interface room_change_pass
{
    room_name: string,
    new_pass: string
}


export {room_rename,room_change_pass};