export interface UpdatePongPlayerDTO
{
    player_id: number, // 1 (you) - 2 (opponent)
    position: number,
    velocity: number,
    key: number // -1 - 1
    // todo add key 
}