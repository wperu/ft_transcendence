import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FinishedGame } from 'src/entities/finishedGame.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { GameHistoryService } from './game-history.service';
import { GetFinishedGameDto, PostFinishedGameDto	} from 'src/Common/Dto/FinishedGameDto';

@Controller('game-history')
export class GameHistoryController
{
	constructor (
		private readonly historyService: GameHistoryService,
		private readonly userService: UsersService
		) {}

	@Get('/:id')
	async	getUserHistory(@Param('id') target_id) : Promise<GetFinishedGameDto []>
	{
		let target_user: User;
		let	entity: FinishedGame[];
		let	history: GetFinishedGameDto[] = [];
		target_user = await this.userService.findUserByID(target_id);
		entity = await this.historyService.getUserGameHistory(target_user);
		console.log("getting games");

		let i = 0;
		entity.map(({player_one, player_two, date, player_one_score, player_two_score}) => {
			history.push({
				id_one: player_one.id,
				id_two: player_two.id,
				username_one: player_one.username,
				username_two: player_two.username,
				score_one: player_one_score,
				score_two: player_two_score,
				date: date,
			});
		});
		return (history);
	}
	@Post()
	async	addFinishedGame(@Body() gameData: PostFinishedGameDto) : Promise<FinishedGame>
	{
		let user_one: User;
		let user_two: User;
		user_one = await this.userService.findUserByID(gameData.user_one_id);
		user_two = await this.userService.findUserByID(gameData.user_two_id);
		console.log("posting game: " + gameData.date);
		return (await this.historyService.addGameToHistory(user_one, user_two,
			gameData.user_one_score, gameData.user_two_score, gameData.date));

	}

}
