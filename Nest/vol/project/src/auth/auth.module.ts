import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config'
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';

@Module({
imports: [
			forwardRef(() => UsersModule),
			TypeOrmModule.forFeature([User]),
			ConfigModule.forRoot(), 
			HttpModule.register({
				timeout: 5000,
				maxRedirects: 5,
			})
		 ],
providers: [AuthService, UsersService],
controllers: [AuthController]
})
export class AuthModule {}
