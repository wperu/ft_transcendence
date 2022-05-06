import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { TokenValidatorEntity } from './entities/token_validator.entity';
import { ChatModule } from './chat/chat.module';
import { FriendShip } from './entities/friend_ship.entity';
import { FriendsModule } from './friends/friends.module';
import { RoomModule } from './room/room.module';
import DatabaseFile from './entities/databaseFile.entity';
import { ChatRoomEntity } from './entities/room.entity';
import { ChatRoomRelationEntity } from './entities/roomRelation.entity';
import { GameHistoryModule } from './game-history/game-history.module';
import { FinishedGame } from './entities/finishedGame.entity';


@Module({
	imports: [TypeOrmModule.forRoot(
		{
			type: 'postgres',
			host: 'db',
			port: 5432,
			username: 'postgres',
			password: 'example',
			database: 'postgres',
			entities: [
				User,
				TokenValidatorEntity,
				FriendShip,
				DatabaseFile,
				FinishedGame,
				ChatRoomRelationEntity,
				ChatRoomEntity
			],
			synchronize: true,
		}
	), UsersModule, AuthModule, ChatModule, FriendsModule, RoomModule, GameHistoryModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
