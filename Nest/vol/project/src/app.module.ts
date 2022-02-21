import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

@Module({
  imports: [TypeOrmModule.forRoot(
	{
		type: 'postgres',
		host: 'db',
		port: 5432,
		username: 'postgres',
		password: 'example',
		database: 'postgres',
		entities: [User],
		synchronize: true,
	  }
  ), UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
