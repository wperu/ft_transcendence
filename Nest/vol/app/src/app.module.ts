import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { JwtEntity } from './entities/jwt.entity';
import { JwtModule } from './auth/jwt/jwt.module';
import { ChatModule } from './chat/chat.module';

@Module({
	imports: [TypeOrmModule.forRoot(
		{
			type: 'postgres',
			host: 'db',
			port: 5432,
			username: 'postgres',
			password: 'example',
			database: 'postgres',
			entities: [User, JwtEntity],
			synchronize: true,
		}
	), UsersModule, AuthModule, JwtModule, ChatModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
