import { Global, Module } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TokenService } from 'src/auth/token.service';
import { AuthModule } from 'src/auth/auth.module';

@Global()
@Module({
	imports: [
		...AuthModule.getDependencies()
	],
	controllers: [UsersController],
	providers: [UsersService, AuthService, TokenService],
	exports: [UsersService],
})
export class UsersModule {}
