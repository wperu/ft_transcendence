import { Body, Controller, Get, Param, Post, BadRequestException } from '@nestjs/common';
import { FinishedGame } from 'src/entities/finishedGame.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { GameHistoryService } from './game-history.service';
import { GetFinishedGameDto, PostFinishedGameDto } from 'src/Common/Dto/pong/FinishedGameDto';

@Controller('game-history')
export class GameHistoryController
{
	constructor (
		private readonly historyService: GameHistoryService,
		private readonly userService: UsersService
		) {}

	@Get('/:refId')
	async	getUserHistory(@Param('refId') target_ref_id) : Promise<GetFinishedGameDto []>
	{
		let target_user: User;
		let	entity: FinishedGame[];
		let	history: GetFinishedGameDto[] = [];
		target_user = await this.userService.findUserByReferenceID(target_ref_id);
		entity = await this.historyService.getUserGameHistory(target_user);
		let i = 0;
		entity.map(({player_one, player_two, date, player_one_score, player_two_score, custom}) => {
			history.push({
				ref_id_one: player_one.reference_id,
				ref_id_two: player_two.reference_id,
				username_one: player_one.username,
				username_two: player_two.username,
				score_one: player_one_score,
				score_two: player_two_score,
				custom: custom,
				date: date,
			});
		});
		return (history);
	}

	@Post()
	async	addFinishedGame(@Body() gameData: PostFinishedGameDto)
	{
		let user_one: User;
		let user_two: User;
		console.log(gameData);
		try
		{
			console.log(gameData.user_one_ref_id);
			user_one = await this.userService.findUserByReferenceID(gameData.user_one_ref_id);
			user_two = await this.userService.findUserByReferenceID(gameData.user_two_ref_id);
		} catch (e)
		{
			console.error(e);
		}
		if (!user_one || !user_two)
			throw new BadRequestException("User doesn't exist");
		if (gameData.user_one_score > gameData.user_two_score)
		{
			this.userService.addWin(user_one);
			this.userService.addLoss(user_two);
		}
		else if (gameData.user_two_score > gameData.user_one_score)
		{
			this.userService.addWin(user_two);
			this.userService.addLoss(user_one);
		}
		else
		{
			this.userService.addDraw(user_one);
			this.userService.addDraw(user_two);
		}
		await this.historyService.addGameToHistory(user_one, user_two,
			gameData.user_one_score, gameData.user_two_score, new Date,
			gameData.custom);
	}
}
