import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { UserData } from 'src/chat/interface/ChatUser';
import { UserToken } from 'src/Common/Dto/User/UserToken';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { RoomState } from '../Common/Dto/pong/PongRoomDto'
import { PongRoom } from './interfaces/PongRoom';
import { PongUser } from './interfaces/PongUser';


@Injectable()
export class PongService {

    private logger: Logger = new Logger('AppService');

    constructor(
        private usersService: UsersService,
        private rooms: Array<PongRoom>,
        private users: Array<PongUser>,
        private tokenService: TokenService
    )
    {}

    createRoom(creator: PongUser)
    {
        let new_room = {
            player_1: creator,
            player_2: undefined,
            spectators: [],
            state: RoomState.WAITING
        };

        this.rooms.push(new_room)
        return (new_room);
    }


    searchRoom(user: PongUser)
    {
        let room = this.rooms.find((r) => { return r.state === RoomState.WAITING });

        this.logger.log("searching room");

        if (room === undefined || this.rooms === null)
        {
            this.createRoom(user);
            this.logger.log("created new room for user ");
            return ;
        }

        this.logger.log("joined waiting room");
        room.player_2 = user;
        this.startRoom(room);
    }


    startRoom(room: PongRoom)
    {
        let starting_obj = {   /* TODO DTO */

        }

        room.state = RoomState.PLAYING;
        room.player_1.socket.forEach((s) => {
            s.emit('STARTING_ROOM', starting_obj);
        })

        room.player_2.socket.forEach((s) => {
            s.emit('STARTING_ROOM', starting_obj);
        })

        console.log("sent start request to players");

        room.spectators.forEach((usr) => {
            usr.socket.forEach((s) => {
                s.emit('STARTING_ROOM', starting_obj);
            }
        )})

        console.log("sent start request to spectators");
    }


    async connectUserFromSocket(socket: Socket): Promise<PongUser | undefined>
	{
        const data: UserToken = this.tokenService.decodeToken(socket.handshake.auth.token) as UserToken;

		if (data === null)
        {
            console.log("[PONG] unable to decode user token data");
			return (undefined);
        }
		
        const user_info: User = await this.usersService.findUserByReferenceID(data.reference_id)

        if (user_info === undefined)
        {
            console.log(`[PONG] Unregistered user in database had access to a valid token : ${socket.id} aborting connection`);
            socket.disconnect();
            return (undefined);
        }

		let idx = this.users.push({
			socket: [socket], 
			username: user_info.username,
            points: 0,
        } as PongUser)

		return this.users[idx - 1];
	}


    async getUserFromSocket(socket: Socket): Promise<PongUser | undefined>
    {
        const data: UserToken = this.tokenService.decodeToken(socket.handshake.auth.token) as UserToken;

		if (data === null)
			return (undefined);

		if (data as UserToken)
		{
			const us = data as UserToken;


			let user_info = await this.usersService.findUserByReferenceID(data.reference_id);

			if (user_info === undefined)
			{
				console.log(`[CHAT] Unregistered user in database had access to a valid token : ${socket.id} aborting connection`)
				socket.disconnect();
				return (undefined);
			}

			let ret = this.users.find((u) => { return u.username === user_info.username})
			return (ret);
		}

        return (undefined);
    }

}
