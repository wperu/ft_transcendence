export interface PostFinishedGameDto
{
	ref_id_one: number;
	ref_id_two: number;
	score_one: number;
	score_two: number;
	game_modes: number;
	custom: boolean;
	withdrew: number; // 0 or 1 or 2
}

export interface GetFinishedGameDto
{
	date: Date,
	ref_id_one: number;
	ref_id_two: number;
	username_one: string;
	username_two: string;
	score_one: number;
	score_two: number;
	custom: boolean;
	game_modes: number;
	withdrew: number; // 0 = nobody, 1 = player 1, 2 = player 2
}
