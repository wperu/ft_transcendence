import { forwardRef, Module } from '@nestjs/common';
import * as PgBoss from 'pg-boss';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/auth/token.service';
import { ChatModule } from 'src/chat/chat.module';
import { GameHistoryModule } from 'src/game-history/game-history.module';
import { UsersModule } from 'src/users/users.module';
import { GameService } from './game.service';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';

@Module({
  imports: [AuthModule, forwardRef(() => ChatModule), GameHistoryModule],
  providers: [PongService, GameService, PongGateway],
  exports: [PongService],
})
export class PongModule {}
