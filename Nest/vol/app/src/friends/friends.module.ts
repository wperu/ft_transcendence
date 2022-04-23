import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendShip } from 'src/entities/friend_ship.entity';
import { User } from 'src/entities/user.entity';
import { FriendsService } from './friends.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, FriendShip])],
 	providers: [FriendsService],
	exports: [FriendsService]
})
export class FriendsModule {}
