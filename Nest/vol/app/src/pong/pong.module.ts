import { forwardRef, Module } from '@nestjs/common';
import * as PgBoss from 'pg-boss';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/auth/token.service';
import { UsersModule } from 'src/users/users.module';
import { GameService } from './game.service';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';

@Module({
  imports: [AuthModule],
  providers: [PongService, GameService, PongGateway],
})
export class PongModule {}
