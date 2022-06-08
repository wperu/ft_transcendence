import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinishedGame } from 'src/entities/finishedGame.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GameHistoryService {
	constructor (
		@InjectRepository(FinishedGame)
		private finishedGames: Repository<FinishedGame>
	)
	{}

	async getUserGameHistory(user: User): Promise<FinishedGame []>
	{
		return (await this.finishedGames.find({
			relations: ["player_one", "player_two"],
			where: [
				{ player_one: user},
				{ player_two: user},
			],
		}));
	}

	async addGameToHistory(user_one: User, user_two: User, score_one: number,
		score_two: number, date: Date, custom: boolean) : Promise<FinishedGame>
	{
		let new_game : FinishedGame = new FinishedGame();
		let	ret;
		new_game.date = date;
		new_game.player_one = user_one;
		new_game.player_two = user_two;
		new_game.player_one_score = score_one;
		new_game.player_two_score = score_two;
		new_game.custom = custom;
		try
		{
			ret = await this.finishedGames.save(new_game);
		} catch (error)
		{
			console.error(error);
			return (undefined);
		}
		console.log("game added");
		return (ret);
	}
}
