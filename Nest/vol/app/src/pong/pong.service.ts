import { Injectable, Logger, SerializeOptions } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { UserToken } from 'src/Common/Dto/User/UserToken';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PongRoom, RoomState } from './interfaces/PongRoom';
import { PongUser } from './interfaces/PongUser';
import { StartPongRoomDTO } from '../Common/Dto/pong/StartPongRoomDTO'
import { UpdatePongRoomDTO } from '../Common/Dto/pong/UpdatePongRoomDTO'
import { PongBall } from './interfaces/PongBall';
import { threadId } from 'worker_threads';
import { UpdatePongBallDTO } from 'src/Common/Dto/pong/UpdatePongBallDTO';
import { randomInt } from 'crypto';
import { SendPlayerKeystrokeDTO } from 'src/Common/Dto/pong/SendPlayerKeystrokeDTO';
import { Z_BEST_SPEED } from 'zlib';
import { UpdatePongPlayerDTO } from 'src/Common/Dto/pong/UpdatePongPlayerDTO';


// REVIEW do we want multiple socket for pong user ? 

@Injectable()
export class PongService {

    private logger: Logger = new Logger('AppService');


    private TICK_RATE: number = 100; // in ms

    private BALL_SIZE: number = 0.1;
    private PLAYER_SIZE: number = 0.25;
    private PLAYER_SPEED: number = 0.09;
    private PLAYER_FRICTION: number = 0.5;
    private TERRAIN_PADDING_X: number = 0.05;
    private TERRAIN_PADDING_Y: number = 0.11;

    constructor(
        private usersService: UsersService,
        private rooms: Array<PongRoom>,
        private users: Array<PongUser>,
        private tokenService: TokenService
    )
    {}




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
            position: 0.5,
            velocity: 0,
            key: 0,
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

            if (ret === undefined)
            {
                console.log(`Could not retrieve pong user from database user infos`);
                return undefined;
            }
			return (ret);
		}

        return (undefined);
    }




    initRoom(creator: PongUser) : PongRoom
    {
        return ({
            room_id: randomInt(9999999),
            player_1: creator,
            player_2: undefined,
            ball: {
                pos_x: 1,
                pos_y: 0.5,
                vel_x: randomInt(1) > 0.5 ? -0.1 : 0.1,
                vel_y: randomInt(-2, 2) / 100
            } as PongBall,
            spectators: [],
            state: RoomState.WAITING
        });
    }




    reloadRoom(room: PongRoom)
    {
        room.ball.pos_x = 1;
        room.ball.pos_y = 0.5;
        room.ball.vel_x = randomInt(1) > 0.5 ? -0.1 : 0.1;
        room.ball.vel_y = randomInt(-2, 2) / 100;
    }





    createRoom(creator: PongUser)
    {
        let new_room = this.initRoom(creator);

        while(this.rooms.find((r) => (r.room_id === new_room.room_id)) !== undefined)
        {
            new_room.room_id = randomInt(9999999);
        }

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

        if (user === undefined)
        {
            this.logger.log("undefined user tried to join room")
            return ;
        }
        this.logger.log("joined waiting room");
        room.player_2 = user;
        this.startRoom(room);
    }



    async startRoom(room: PongRoom)
    {
        let starting_obj: StartPongRoomDTO = {
            room_id: room.room_id,

            player_1: {
                username: room.player_1.username,
            },

            player_2: {
                username: room.player_2.username,
            }
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

        setInterval(() => this.runRoom(room), this.TICK_RATE);
    }


    // FIX DECONNECTION CHECK                                                                         
    async runRoom(room: PongRoom) : Promise<PongRoom>
    {
        if (room.player_1.socket.forEach((s) => { s.connected === false }) !== undefined
         || room.player_2.socket.forEach((s) => { s.connected === false }) !== undefined)
        {
            room.state = RoomState.FINISHED;
            this.logger.log("Room ended");
            // TODO push room in history 
            return room;
        }

        this.updateRoom(room);
    }





    updateRoom(room: PongRoom)
    {
        this.gameUpdate(room);

        let updated_room: UpdatePongRoomDTO = {
            ball: {
                pos_x: room.ball.pos_x,
                pos_y: room.ball.pos_y,
            },

            player_1_pos: room.player_1.position,
            player_2_pos: room.player_2.position,
        };


        room.player_1.socket.forEach((s) => { s.emit('UPDATE_PONG_BALL', {
            ball_x: updated_room.ball.pos_x,
            ball_y: updated_room.ball.pos_y,
        } as UpdatePongBallDTO) });

        room.player_2.socket.forEach((s) => { s.emit('UPDATE_PONG_BALL', {
            ball_x: updated_room.ball.pos_x,
            ball_y: updated_room.ball.pos_y,
        } as UpdatePongBallDTO) });


        room.player_1.socket.forEach((s) => { s.emit('UPDATE_PONG_PLAYER', {
            player_id: 1,
            position: updated_room.player_1_pos,
        } as UpdatePongPlayerDTO) });

        room.player_1.socket.forEach((s) => { s.emit('UPDATE_PONG_PLAYER', {
            player_id: 2,
            position: updated_room.player_2_pos,
        } as UpdatePongPlayerDTO) });

        room.player_2.socket.forEach((s) => { s.emit('UPDATE_PONG_PLAYER', {
            player_id: 1,
            position: updated_room.player_1_pos,
        } as UpdatePongPlayerDTO) });

        room.player_2.socket.forEach((s) => { s.emit('UPDATE_PONG_PLAYER', {
            player_id: 2,
            position: updated_room.player_2_pos,
        } as UpdatePongPlayerDTO) });
    }




    updatePlayer(data: SendPlayerKeystrokeDTO)
    {
        let room = this.rooms.find ((r) => r.room_id === data.room_id);

        if (room === undefined)
        {
            console.log(`cannot update undefined room with id: ${data.room_id}`);
            return ;
        }

        // HACK retrieve user 1 & 2 with socket instead of the player_id from an untrustable user to avoid position cheating 
        if (data.player_id === 1)
        {
            if (data.state === 0)
                room.player_1.key = 0;
            else
                room.player_1.key = data.key === 1 ? -1 : 1;
        }
        else if (data.player_id === 2)
        {
            if (data.state === 0)
            {
                room.player_2.key = 0;
            }
            else
                room.player_2.key = data.key === 1 ? -1 : 1;
        }
    }


    /* REVIEW Game logic here, maybe rewrap this into another service */
    gameUpdate(room: PongRoom)
    {
        /*
            TERRAIN BOUNDS AND OVERALL DIMENSIONS
            ball:
            x: 0 - 2
            y: 0 - 1
            player:
            y: 0 - 1
            front end will stretch the values as desired to prevent using
            too much ressources for calculating visual effects on the back-end 
        */
        let terrain_x = 0, terrain_y = 0, terrain_sx = 2, terrain_sy = 1; 


        /* Calculating next frame velocities */

        // ball
        if (room.ball.pos_y > terrain_sy || room.ball.pos_y < 0)
        {
            room.ball.vel_y *= -1;
        }

        if (room.ball.pos_x > terrain_sx || room.ball.pos_x < 0)
        {
            this.reloadRoom(room);
            return ;
        }


        // player
        if (room.player_1.key !== 0)
            room.player_1.velocity = room.player_1.key * this.PLAYER_SPEED
        else 
            room.player_1.velocity *= this.PLAYER_FRICTION;

        if (room.player_2.key !== 0)
            room.player_2.velocity = room.player_2.key * this.PLAYER_SPEED;
        else 
            room.player_2.velocity *= this.PLAYER_FRICTION;


        // ball collision with player
        if (room.ball.pos_x > this.TERRAIN_PADDING_X
            && room.ball.pos_x < this.TERRAIN_PADDING_X + this.BALL_SIZE
            && room.ball.pos_y > room.player_1.position - this.PLAYER_SIZE * 0.5
            && room.ball.pos_y < room.player_1.position + this.PLAYER_SIZE * 0.5)
                room.ball.vel_x *= -1;
        

        if (room.ball.pos_x < 2.0
            && room.ball.pos_x > 2.0 - this.TERRAIN_PADDING_X - this.BALL_SIZE
            && room.ball.pos_y > room.player_2.position - this.PLAYER_SIZE * 0.5
            && room.ball.pos_y < room.player_2.position + this.PLAYER_SIZE * 0.5)
                room.ball.vel_x *= -1;
        

        /* Updating positions */
       room.ball.pos_x += room.ball.vel_x;
       room.ball.pos_y += room.ball.vel_y;
       room.player_1.position += room.player_1.velocity;
       room.player_2.position += room.player_2.velocity;


        /* Player wall collisions */
        // 1
        if (room.player_1.position < this.TERRAIN_PADDING_Y)
        {
            room.player_1.velocity = 0;
            room.player_1.position = this.TERRAIN_PADDING_Y;
        }

        if (room.player_1.position > 1 - this.TERRAIN_PADDING_Y)
        {
            room.player_1.velocity = 0;
            room.player_1.position = 1 - this.TERRAIN_PADDING_Y;
        }

        // 2
        if (room.player_2.position < this.TERRAIN_PADDING_Y)
        {
            room.player_2.velocity = 0;
            room.player_2.position = this.TERRAIN_PADDING_Y;
        }

        if (room.player_2.position > 1 - this.TERRAIN_PADDING_Y)
        {
            room.player_2.velocity = 0;
            room.player_2.position = 1 - this.TERRAIN_PADDING_Y;
        }
    }
}
