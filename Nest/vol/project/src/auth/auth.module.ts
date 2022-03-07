import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config'
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtService } from './jwt/jwt.service';
import { JwtEntity } from 'src/entities/jwt.entity';

@Module({
imports: [
			TypeOrmModule.forFeature([User]),
			TypeOrmModule.forFeature([JwtEntity]),
			ConfigModule.forRoot(), 
			HttpModule.register({
				timeout: 5000,
				maxRedirects: 5,
			}),
			JwtModule,
		 ],
providers: [AuthService, UsersService, JwtService],
controllers: [AuthController]
})
export class AuthModule {}
