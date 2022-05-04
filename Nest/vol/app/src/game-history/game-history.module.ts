import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameHistoryService } from './game-history.service';
import { FinishedGameEntity } from 'src/entities/finishedGameEntity';

@Module({
	imports: [TypeOrmModule.forFeature([FinishedGameEntity])],
	providers: [GameHistoryService],
})
export class GameHistoryModule {}
