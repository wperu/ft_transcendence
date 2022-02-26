import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config'

@Module({
imports: [
			ConfigModule.forRoot(), 
			HttpModule.register({
				timeout: 5000,
				maxRedirects: 5,
			})
		 ],
providers: [AuthService],
controllers: [AuthController]
})
export class AuthModule {}
