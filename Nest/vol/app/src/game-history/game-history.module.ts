import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameHistoryService } from './game-history.service';
import { FinishedGame } from 'src/entities/finishedGame.entity';
import { GameHistoryController } from './game-history.controller';
import { UsersModule } from "src/users/users.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [TypeOrmModule.forFeature([FinishedGame]), UsersModule, AuthModule],
	providers: [GameHistoryService],
	controllers: [GameHistoryController],
})
export class GameHistoryModule {}
