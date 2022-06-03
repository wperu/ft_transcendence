
export interface StartPongRoomDTO
{
    room_id: string,
    options: number,

    player_1: {
        username: string,
    }

    player_2: {
        username: string,
    }
}