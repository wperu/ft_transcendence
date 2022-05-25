
export interface SendPlayerKeystrokeDTO
{
    room_id: string,
    player_id: number, // 1-2
    key: number,     // Up: 1      , Down: 0
    state: number,   // Pressed: 1 , Released: 0
}
