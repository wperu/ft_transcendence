import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameHistoryService } from './game-history.service';
import { FinishedGame } from 'src/entities/finishedGame.entity';
import { GameHistoryController } from './game-history.controller';
import { UsersModule } from "src/users/users.module";

@Module({
	imports: [TypeOrmModule.forFeature([FinishedGame]), UsersModule],
	providers: [GameHistoryService],
	controllers: [GameHistoryController],
})
export class GameHistoryModule {}
