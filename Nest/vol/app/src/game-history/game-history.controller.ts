import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FinishedGame } from 'src/entities/finishedGame.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { GameHistoryService } from './game-history.service';
import {FinishedGameDto	} from 'src/Common/Dto/FinishedGameDto';

@Controller('game-history')
export class GameHistoryController
{
	constructor (
		private readonly historyService: GameHistoryService,
		private readonly userService: UsersService
		) {}

	@Get('/:id')
	async	getUserHistory(@Param('id') target_id) : Promise<FinishedGame []>
	{
		let target_user: User;
		target_user = await this.userService.findUserByID(target_id);
		console.log("getting games");
		return (await this.historyService.getUserGameHistory(target_user));
	}
	@Post()
	async	addFinishedGame(@Body() gameData: FinishedGameDto) : Promise<FinishedGame>
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
