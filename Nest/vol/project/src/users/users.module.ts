import { HttpModule } from '@nestjs/axios';
import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { User } from '../entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Global()
@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		ConfigModule.forRoot(), 
		HttpModule.register({
			timeout: 5000,
			maxRedirects: 5,
		})
		//(forwardRef(() => AuthService))
	],
	controllers: [UsersController],
	providers: [UsersService, AuthService],
	exports: [UsersService]
})
export class UsersModule {}
