import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { TokenValidatorEntity } from './entities/token_validator.entity';
import { ChatModule } from './chat/chat.module';
import { PongModule } from './pong/pong.module';
import { PongGateway } from './pong/pong.gateway';
import { PongService } from './pong/pong.service';
import { TokenService } from './auth/token.service';
import { FriendShip } from './entities/friend_ship.entity';
import { FriendsModule } from './friends/friends.module';

@Module({
	imports: [TypeOrmModule.forRoot(
		{
			type: 'postgres',
			host: 'db',
			port: 5432,
			username: 'postgres',
			password: 'example',
			database: 'postgres',
			entities: [User, TokenValidatorEntity, FriendShip],
			synchronize: true,
		}
	), UsersModule, AuthModule, ...AuthModule.getDependencies(), ChatModule, PongModule],
	controllers: [AppController],
	providers: [AppService, PongService, PongGateway, Array, TokenService],
})
export class AppModule {}
