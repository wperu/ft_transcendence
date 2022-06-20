import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinishedGame } from 'src/entities/finishedGame.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from "src/users/users.service";
import { PostFinishedGameDto } from 'src/Common/Dto/pong/FinishedGameDto';

@Injectable()
export class GameHistoryService {

	private logger: Logger = new Logger('GameHistoryService');

	constructor (
		@InjectRepository(FinishedGame)
		private finishedGames: Repository<FinishedGame>,
		private usersService: UsersService
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

	async addGameToHistory(game: PostFinishedGameDto)
	{
		let new_game : FinishedGame = new FinishedGame();
		let	ret;
		let user_one : User;
		let user_two : User;

		try
		{
			user_one = await this.usersService.findUserByReferenceID(game.ref_id_one);
			user_two = await this.usersService.findUserByReferenceID(game.ref_id_two);
		} catch (error)
		{
			console.error(error);
			return ;
		}
		if (!user_one || !user_two)
		{
			console.error("GameHistory retrieving user error");
			return ;
		}

		new_game.date = new Date();
		new_game.player_one = user_one;
		new_game.player_two = user_two;
		new_game.player_one_score = game.score_one;
		new_game.player_two_score = game.score_two;
		new_game.custom = game.custom;
		new_game.game_modes = game.game_modes;
		new_game.withdrew = game.withdrew;
		try
		{
			ret = await this.finishedGames.save(new_game);
			this.logger.log("added game to history");
		} catch (error)
		{
			console.error(error);
			return ;
		}

		if (!game.custom)
		{
			if ((game.score_one > game.score_two && game.withdrew === 0)
				|| game.withdrew === 2)
			{
				this.usersService.addWin(user_one);
				this.usersService.addLoss(user_two);
			}
			else if ((game.score_two > game.score_one && game.withdrew === 0)
				|| game.withdrew === 1)
			{
				this.usersService.addWin(user_two);
				this.usersService.addLoss(user_one);
			}
			else
			{
				this.usersService.addDraw(user_one);
				this.usersService.addDraw(user_two);
			}
		}
		return (ret);
	}
}
