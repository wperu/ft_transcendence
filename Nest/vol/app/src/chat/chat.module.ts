import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/auth/token.service';
import { UsersService } from 'src/users/users.service';
import { FriendsModule } from 'src/friends/friends.module';
import { FriendsService } from 'src/friends/friends.service';
import { RoomModule } from 'src/room/room.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
	imports: [
		FriendsModule,
		UsersModule,
		RoomModule,
		AuthModule
	],
	providers: [Array, ChatService, ChatGateway]
})
export class ChatModule {}
