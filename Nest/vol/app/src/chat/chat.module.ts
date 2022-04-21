import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/auth/token.service';
import { FriendsService } from 'src/friends/friends.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
	imports: [
		...AuthModule.getDependencies()
	],
	providers: [Array, ChatService, ChatGateway, TokenService, FriendsService]
})
export class ChatModule {}
