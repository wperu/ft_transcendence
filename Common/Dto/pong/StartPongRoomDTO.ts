
export interface StartPongRoomDTO
{
    room_id: string,

    player_1: {
        username: string,
    }

    player_2: {
        username: string,
    }
}