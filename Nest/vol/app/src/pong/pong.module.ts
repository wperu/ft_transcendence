import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/auth/token.service';
import { PongService } from './pong.service';

@Module({
  imports: [...AuthModule.getDependencies()],
  providers: [PongService, TokenService, Array]
})
export class PongModule {}
