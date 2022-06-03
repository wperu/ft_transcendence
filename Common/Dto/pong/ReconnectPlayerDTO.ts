
export interface ReconnectPlayerDTO
{
    room_id: string,

    options: number,

    player_1: {
        position: number,
        username: string,
        points: number,
    }
    player_2: {
        position: number,
        username: string,
        points: number,
    }
    ball: {
        x: number,
        y: number,
        vel_x: number,
        vel_y: number,
    }


    ball2?: {
        x: number,
        y: number,
        vel_x: number,
        vel_y: number,
    }
}