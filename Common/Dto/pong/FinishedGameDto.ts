export interface PostFinishedGameDto
{
	ref_id_one: number;
	ref_id_two: number;
	score_one: number;
	score_two: number;
	game_modes: number;
	custom: boolean;
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
}
