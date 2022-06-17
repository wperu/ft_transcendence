import {  Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessageEntity } from 'src/entities/message.entity';
import { ChatRoomEntity } from 'src/entities/room.entity';
import { ChatRoomRelationEntity } from 'src/entities/roomRelation.entity';
// import { ChatMessageService } from './room.message.service';
import { ChatPasswordService } from './room.password.service';
import { RoomService } from './room.service';

@Module({
	imports: [TypeOrmModule.forFeature([ChatRoomEntity, ChatRoomRelationEntity, ChatMessageEntity])],
	providers: [ChatPasswordService, RoomService],
	exports: [RoomService],
})
export class RoomModule {}
