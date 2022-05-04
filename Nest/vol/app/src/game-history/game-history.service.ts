import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinishedGameEntity } from 'src/entities/finishedGameEntity';
import { Repository } from 'typeorm';

@Injectable()
export class GameHistoryService {
	constructor (
		@InjectRepository(FinishedGameEntity)
		private finishedGames: Repository<FinishedGameEntity>
	)
	{}
}
