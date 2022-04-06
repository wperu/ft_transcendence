import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from 'src/auth/jwt/jwt.module';
import { User } from '../entities/user.entity';
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
		}),
		JwtModule
	],
	controllers: [UsersController],
	providers: [UsersService, AuthService],
	exports: [UsersService]
})
export class UsersModule {}
