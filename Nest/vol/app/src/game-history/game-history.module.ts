import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameHistoryService } from './game-history.service';
import { FinishedGame } from 'src/entities/finishedGame.entity';
import { GameHistoryController } from './game-history.controller';

@Module({
	imports: [TypeOrmModule.forFeature([FinishedGame])],
	providers: [GameHistoryService],
	controllers: [GameHistoryController],
})
export class GameHistoryModule {}
