import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [],
  providers: [Array, ChatService, ChatGateway]
})
export class ChatModule {}
