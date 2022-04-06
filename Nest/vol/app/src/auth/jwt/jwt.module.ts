import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtEntity } from '../../entities/jwt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([JwtEntity]),
	],
	providers: [JwtService],
	exports: [JwtService]
})
export class JwtModule {}
