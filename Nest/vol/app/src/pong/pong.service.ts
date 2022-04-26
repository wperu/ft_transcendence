import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { UserData } from 'src/chat/interface/ChatUser';
import { RoomState } from '../Common/Dto/pong/PongRoomDto'
import { PongRoom } from './interfaces/PongRoom';
import { PongUser } from './interfaces/PongUser';


@Injectable()
export class PongService {

    private logger: Logger = new Logger('AppService');

    constructor(
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

        if (room === undefined)
        {
            this.createRoom(user);
            this.logger.log("created new room for user ");
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

        room.spectators.forEach((usr) => {
            usr.socket.forEach((s) => {
                s.emit('STARTING_ROOM', starting_obj);
            }
        )})
    }


    connectUserFromSocket(socket: Socket): PongUser | undefined
	{
        const data: PongUser = this.tokenService.decodeToken(socket.handshake.auth.token) as PongUser;

		if (data === null)
			return (undefined);
		
		let idx = this.users.push({
			socket: [socket], 
			username: data.username,
            points: 0,
        })

		return this.users[idx - 1];
	}


    getUserFromSocket(socket: Socket): PongUser | undefined
    {
        const data: Object = this.tokenService.decodeToken(socket.handshake.auth.token);
        /* todo   maybe check if data contains the keys that we have in PongUser */
        /* todo   and only that so we cant pass data through here                */
		if (data === null)
			return (undefined);

		if (data as UserData)
		{
			const us = data as UserData;

			let ret = this.users.find((u) => { return u.username === us.username})
			return (ret);
		}

        return (undefined);
    }

}
