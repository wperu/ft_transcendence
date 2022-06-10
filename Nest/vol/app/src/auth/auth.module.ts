import { DynamicModule, forwardRef, ForwardReference, Module, ModuleMetadata, Type } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { TokenService } from './token.service';
import { TokenValidatorEntity } from 'src/entities/token_validator.entity';
import { JwtModule } from '@nestjs/jwt'
import { TwoFactorService } from './auth.twoFactor.service';
import { AuthGuard } from "./auth.guard";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, TokenValidatorEntity]),
		ConfigModule.forRoot(),
		HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
		JwtModule.register({ secret: process.env.APP_SECRET }),
		forwardRef(() => UsersModule)
	],
	providers: [AuthService, TwoFactorService, TokenService, AuthGuard],
	controllers: [AuthController],
	exports: [AuthService, TwoFactorService, TokenService, AuthGuard]
})

export class AuthModule {}
