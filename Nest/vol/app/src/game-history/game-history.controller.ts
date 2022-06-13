import { Body, Controller, Get, Param, Post, BadRequestException, UseGuards } from '@nestjs/common';
import { FinishedGame } from 'src/entities/finishedGame.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { GameHistoryService } from './game-history.service';
import { GetFinishedGameDto, PostFinishedGameDto } from 'src/Common/Dto/pong/FinishedGameDto';
import { AuthGuard } from "src/auth/auth.guard";

@Controller('game-history')
export class GameHistoryController
{
	constructor (
		private readonly historyService: GameHistoryService,
		private readonly userService: UsersService
		) {}

	@Get('/:refId')
	@UseGuards(AuthGuard)
	async	getUserHistory(@Param('refId') target_ref_id) : Promise<GetFinishedGameDto []>
	{
		let target_user: User;
		let	entity: FinishedGame[];
		let	history: GetFinishedGameDto[] = [];
		try
		{
			target_user = await this.userService.findUserByReferenceID(target_ref_id);
			entity = await this.historyService.getUserGameHistory(target_user);
		}
		catch (error)
		{
			console.log(error);
			throw (new BadRequestException(error));
		}
		
		entity.map(({
			player_one,
			player_two,
			date,
			player_one_score,
			player_two_score,
			custom,
			game_modes
		}) => {
			history.push({
				ref_id_one: player_one.reference_id,
				ref_id_two: player_two.reference_id,
				username_one: player_one.username,
				username_two: player_two.username,
				score_one: player_one_score,
				score_two: player_two_score,
				custom: custom,
				game_modes: game_modes,
				date: date,
			});
		});
		return (history);
	}

	// @Post()
	// async	addFinishedGame(@Body() gameData: PostFinishedGameDto)
	// {
	// 	this.historyService.addGameToHistory(gameData);
	// }
}
