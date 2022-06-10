import { Global, Module, forwardRef } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TokenService } from 'src/auth/token.service';
import { AuthModule } from 'src/auth/auth.module';
import { TwoFactorService } from 'src/auth/auth.twoFactor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';


@Global()
@Module({
	imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([User])],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
