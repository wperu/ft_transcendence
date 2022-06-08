export interface PostFinishedGameDto
{
	user_one_ref_id: number;
	user_two_ref_id: number;
	user_one_score: number;
	user_two_score: number;
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
}
