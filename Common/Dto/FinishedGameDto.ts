export interface PostFinishedGameDto
{
	date: Date,
	user_one_id: number;
	user_two_id: number;
	user_one_score: number;
	user_two_score: number;
}

export interface GetFinishedGameDto
{
	date: Date,
	id_one: number;
	id_two: number;
	username_one: string;
	username_two: string;
	score_one: number;
	score_two: number;
}