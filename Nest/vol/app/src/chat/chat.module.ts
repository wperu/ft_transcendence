import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/auth/token.service';
import { FriendsModule } from 'src/friends/friends.module';
import { FriendsService } from 'src/friends/friends.service';
import { RoomModule } from 'src/room/room.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
	imports: [
		...AuthModule.getDependencies(),
		FriendsModule,
		UsersModule,
		RoomModule
	],
	providers: [Array, ChatService, ChatGateway, TokenService]
})
export class ChatModule {}
