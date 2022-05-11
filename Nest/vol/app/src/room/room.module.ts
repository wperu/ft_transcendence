import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessageEntity } from 'src/entities/message.entity';
import { ChatRoomEntity } from 'src/entities/room.entity';
import { ChatRoomRelationEntity } from 'src/entities/roomRelation.entity';
import { UsersModule } from 'src/users/users.module';
import { ChatMessageService } from './room.message.service';
import { RoomService } from './room.service';

@Module({
	imports: [TypeOrmModule.forFeature([ChatRoomEntity, ChatRoomRelationEntity, ChatMessageEntity]), UsersModule],
	providers: [RoomService, ChatMessageService],
	exports: [RoomService],
})
export class RoomModule {}
