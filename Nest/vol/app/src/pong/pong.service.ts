import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { UserToken } from 'src/Common/Dto/User/UserToken';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PongRoom, RoomState } from './interfaces/PongRoom';
import { PongUser } from './interfaces/PongUser';
import { GameConfig } from 'src/Common/Game/GameConfig';
import { ReconnectPlayerDTO } from 'src/Common/Dto/pong/ReconnectPlayerDTO';
import { PongModes, PongPool } from './interfaces/PongPool';
import { GameService } from './game.service';
import { CustomRoom } from './interfaces/CustomRoom';
import { UserCustomRoomDTO } from 'src/Common/Dto/pong/UserCustomRoomDTO';


// REVIEW do we want multiple socket for pong user ? 

@Injectable()
export class PongService {

    private logger: Logger = new Logger('PongService');


    /*
    private frameCount: number = 0;
    private deltaTime: number = 0;
    private last_time: number = 0;
    private current_time: number = 0;
    */


    private server: Server;

    private users: Array<PongUser>;
    private waitingPool: Array<PongPool>;
    private rooms: Array<PongRoom>;
	private customRooms: Array<CustomRoom>;


    constructor(
        private usersService: UsersService,
        private tokenService: TokenService,
    
        @Inject(forwardRef(() => GameService))
        private gameService: GameService,
    )
    {
        // console.log("init pgboss on : postgress://" + process.env.DB_USERNAME + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + "/" + process.env.DB_NAME);
        // this.boss = new PgBoss("postgress://" + process.env.DB_USERNAME + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + "/" + process.env.DB_NAME)
        // this.boss.on('error', (err) => { return console.log("[pg-boss][error] " + err) })
        // this.boss.start();
        this.users = [];
        this.rooms = [];
        this.waitingPool = [];
		this.customRooms = [];
    }

    


    setServer(server: Server)
    {
        this.server = server;
    }






    async registerUserFromSocket(socket: Socket): Promise<PongUser | undefined>
	{
        const data: UserToken = this.tokenService.decodeToken(socket.handshake.auth.token) as UserToken;

		if (data === null)
        {
            console.log("[PONG] unable to decode user token data");
			return (undefined);
        }
		
        const user_info: User = await this.usersService.findUserByReferenceID(data.reference_id)

        // FIX verify if already exists

        if (user_info === undefined)
        {
            console.log(`[PONG] Unregistered user in database had access to a valid token : ${socket.id} aborting connection`);
            socket.disconnect();
            return (undefined);
        }

        let u = this.users.find((u) => { return u.reference_id === user_info.reference_id });
        if (u !== undefined)
        {
            return (u);
        }

		let idx = this.users.push({
			socket: socket, 
			username: user_info.username,
            reference_id: data.reference_id,
            points: 0,
            position: 0.5,
            velocity: 0,
            key: 0,
            in_game: false,
        } as PongUser)

		return this.users[idx - 1];
	}




    getUserFromSocket(socket: Socket): PongUser | undefined
    {
        const data: UserToken = this.tokenService.decodeToken(socket.handshake.auth.token) as UserToken;

		if (data === null)
			return (undefined);

		if (data as UserToken)
		{
			let ret: PongUser = this.users.find((u) => { return u.reference_id === data.reference_id})

            if (ret === undefined)
            {
                console.log(`Could not retrieve pong user from database user infos`);
                return undefined;
            }
			return (ret);
		}

        return (undefined);
    }





    getRoomById(id: string)
    {
        return this.rooms.find ((r) => r.id === id);
    }









    async removeFromWaitingList(client: Socket)
    {
        const user : PongUser = await this.getUserFromSocket(client);

        if (user === undefined)
        {
            return console.log("cannot remove user from waiting list: undefined user")
        }
        if (this.waitingPool !== undefined)
        {
            var i = 0;
            this.waitingPool.forEach((u) => {
                if (u.user === undefined)
                {
                    return console.log("cannot cycle through waiting pool: undefined user")
                }

                if (u.user.username === user.username)
                {
                    console.log(`removed user ${user.username} from waiting list`);
                    this.waitingPool.splice(i, 1);
                }
                i++;
            })
        }
    }


	initPlayer(player: PongUser)
	{
		player.position = 0.5;
		player.points = 0;
		player.velocity = 0;
		player.key = 0;
		player.in_game = false;
	}



    async searchRoom(user: PongUser, modes: PongModes = PongModes.DEFAULT)
    {
        let other = this.waitingPool.find((r) => r.modes === modes);
        this.logger.log("searching other player");
        if (user === undefined)
        {
            this.logger.log("undefined user tried to sneak into waiting list")
            return ;
        }

        if (other === undefined || this.waitingPool.length === 0)
        {
            //this.createRoom(user);
            let pool_usr: PongPool = {
                user: user,
                modes: modes,
            };

            this.waitingPool.push(pool_usr);
            this.logger.log("joined waiting room: " + pool_usr.user.username);
            return ;
        }

        console.log("found opponent")
        this.waitingPool.splice(this.waitingPool.indexOf(other), 1);
		this.initPlayer(other.user);
		this.initPlayer(user);
        let room = this.gameService.initRoom(other.user, user);
        this.rooms.push(room);
        this.gameService.startRoom(room);
    }


	removeRoom(room: PongRoom) : void
	{
		this.rooms.splice(this.rooms.findIndex(({id} ) => id === room.id), 1);
	}
















    async disconnectUser(user: PongUser)
    {
        let room: PongRoom = this.rooms.find((r) => {
            return r !== undefined && (r.player_1.reference_id === user.reference_id || r.player_2.reference_id === user.reference_id)
        });

        if (room === undefined)
        {
            console.log("disconnection from unknown room");
            return ;
        }

        if (room !== undefined && room.state === RoomState.PAUSED)
        {
            room.player_1.in_game = false;
            room.player_2.in_game = false;
            room.state = RoomState.FINISHED;
            //if (room.job_id !== "")
            //    this.boss.offWork(room.job_id);
            //console.log("room ended by disconnection")
            // TODO push room in history
        }
        else if (room !== undefined && room.state !== RoomState.PAUSED)
        {
            room.state = RoomState.PAUSED;
            //this.boss.cancel(room.job_id);
            this.server.to(room.id).emit("PLAYER_DISCONNECT");
            console.log("player disconnected")
        }
    }

    async reconnectUser(user: PongUser, client: Socket)
    {
        let room: PongRoom = this.rooms.find((r) => {
            return r.player_1.reference_id === user.reference_id || r.player_2.reference_id === user.reference_id
        });

        if (room !== undefined && room.state === RoomState.PAUSED)
        {
            let player = undefined;
            if (room.player_1.reference_id === user.reference_id)
                player = room.player_1;
            else 
                player = room.player_2;
            user.socket = client;
            player.socket = user.socket;
            this.server.to(room.id).emit("PLAYER_RECONNECT");
            user.socket.join(room.id);
            user.socket.emit("RECONNECT_YOU", {
                room_id: room.id,
                player_1: {
                    position: room.player_1.position,
                    username: room.player_1.username,
                    points: room.player_1.points,
                },
                player_2: {
                    position: room.player_2.position,
                    username: room.player_2.username,
                    points: room.player_2.points,
                },
                ball: {
                    x: room.ball.pos_x,
                    y: room.ball.pos_y,
                    vel_x: room.ball.vel_x,
                    vel_y: room.ball.vel_y,
                },
            } as ReconnectPlayerDTO);

            console.log("player reconnected")

            new Promise(async () => setTimeout(async () => {
                console.log("starting");
                room.state = RoomState.PLAYING;
                this.gameService.sendBallUpdate(room);
                this.gameService.sendPlayerUpdate(room);
                this.server.to(room.id).emit("START_GAME");
                room.lastTime = 0;

            }, GameConfig.RELOAD_TIME));
        }
    }

	/**
	 * 
	 * @param refId 
	 * @returns 
	 */
	isPlaying(refId: number) : boolean
	{
		let user =  this.users.find((u) => { return u.reference_id === refId});
		if (user)
			return (user.in_game);

		return (false);
	}


	/**
	 *	** CUSTOM ROOMS **
	 */

	findCustomRoomOf(refId : number) : string | undefined
	{
		const room = this.customRooms.find((r) => {
			return (r.users.find((u) => {return u.reference_id === refId}) !== undefined)
		})

		if (room === undefined)
			return undefined;

		return room.id;
	}

	findCustomRoom(id : string)
	{
		let room = this.customRooms.find((r) => (r.id === id));

		if (room === undefined)
			room = this.initCustomRoom(id);
		
		return room;
	}

	initCustomRoom(id: string) : CustomRoom
	{
		this.logger.log(`Init new Custom room ${id}`);
		let room : CustomRoom = {
			id: id,
			users: [],
			opts: undefined, //Todo
		}
		this.customRooms.push(room);

		return room;
	}

	joinCustomRoom(id: string, user: PongUser)
	{
		let room = this.findCustomRoom(id);
		room.users.push(user);
		user.socket.join(id);

		user.socket.emit("JOINED_CUSTOM_ROOM");
		this.sendUserOfCustomRoom(id);
		return;
	}

	leaveCustomRoom(id: string, user: PongUser)
	{
		const room = this.findCustomRoom(id);

		if (room === undefined)
			throw new Error("Room doesn\'t exist");
		const idx = room.users.findIndex((u) => (u === user));
		room.users.splice(idx, 1);

		user.socket.leave(id);

		//user.socket.emit("LEFT_CUSTOM_ROOM");
		this.sendUserOfCustomRoom(id);
		return ;
	}

	

	sendUserOfCustomRoom(id: string) : Array<void>
	{
		
		const room = this.findCustomRoom(id);

		const toDto = (us : Array<PongUser>) => {
			let ret: Array<UserCustomRoomDTO>

			ret = [];

			for (const u of us)
			{
				ret.push({
					reference_id:	u.reference_id,
					username:		u.username,
				})
			}

			return ret;
		}

		//if (room === undefined)
		//	throw new Error("Room doesn\'t exist");
		
		console.log(room.users.length);

		const dto = toDto(room.users);
		this.server.to(id).emit("USERS_CUSTOM_ROOM", dto);
		return ;
	}

	

	
}
