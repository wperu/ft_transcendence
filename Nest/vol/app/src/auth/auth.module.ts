import { DynamicModule, ForwardReference, Module, ModuleMetadata, Type } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config'
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { TokenService } from './token.service';
import { TokenValidatorEntity } from 'src/entities/token_validator.entity';
import { JwtModule } from '@nestjs/jwt'
import e from 'express';

@Module({
	imports: [
		...AuthModule.getDependencies()
	 ],
	providers: [AuthService, UsersService, TokenService],
	controllers: [AuthController],
})

export class AuthModule
{
	static getDependencies() : Array< Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference >
	{
		return [
			TypeOrmModule.forFeature([User, TokenValidatorEntity]),
			ConfigModule.forRoot(), 

			HttpModule.register({
				timeout: 5000,
				maxRedirects: 5,
			}),	

			JwtModule.register({
				secret: process.env.APP_SECRET
			})
		];
	}
}
