export interface UpdatePongBallDTO
{
    ball_x: number,
    ball_y: number,
    vel_x: number,
    vel_y: number,

    ball2?: {
        ball_x: number,
        ball_y: number,
        vel_x: number,
        vel_y: number,
    }
}