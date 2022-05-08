import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomEntity } from 'src/entities/room.entity';
import { ChatRoomRelationEntity } from 'src/entities/roomRelation.entity';
import { UsersModule } from 'src/users/users.module';
import { RoomService } from './room.service';

@Module({
	imports: [TypeOrmModule.forFeature([ChatRoomEntity, ChatRoomRelationEntity]), UsersModule],
	providers: [RoomService],
	exports: [RoomService],
})
export class RoomModule {}
