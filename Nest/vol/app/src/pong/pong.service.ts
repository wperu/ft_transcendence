import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { UserToken } from 'src/Common/Dto/User/UserToken';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PongRoom, RoomOptions, RoomState } from './interfaces/PongRoom';
import { PongUser } from './interfaces/PongUser';
import { GameConfig } from 'src/Common/Game/GameConfig';
import { ReconnectPlayerDTO } from 'src/Common/Dto/pong/ReconnectPlayerDTO';
import { PongModes, PongPool } from './interfaces/PongPool';
import { GameService } from './game.service';
import { CustomRoom } from './interfaces/CustomRoom';
import { UserCustomRoomDTO } from 'src/Common/Dto/pong/UserCustomRoomDTO';
import { ChatService } from 'src/chat/chat.service';
import { UpdateCustomRoomDTO } from 'src/Common/Dto/pong/UpdateCustomRoomDTO';
import { UpdatePongPointsDTO } from 'src/Common/Dto/pong/UpdatePongPointsDTO';
import { GameHistoryService } from 'src/game-history/game-history.service';
import { PostFinishedGameDto } from 'src/Common/Dto/pong/FinishedGameDto';


// REVIEW do we want multiple socket for pong user ?
//TODO updateCustomRoom

@Injectable()
export class PongService {

    private logger: Logger = new Logger('PongService');

    private server: Server;

    private users: Array<PongUser>;
    private waitingPool: Array<PongPool>;
    private rooms: Array<PongRoom>;
	private customRooms: Array<CustomRoom>;


    constructor(
        private usersService: UsersService,
        private tokenService: TokenService,
        private historyService: GameHistoryService,

		@Inject(forwardRef(() => ChatService))
		private chatService: ChatService,
    
        @Inject(forwardRef(() => GameService))
        private gameService: GameService,
    )
    {
        this.users = [];
        this.rooms = [];
        this.waitingPool = [];
		this.customRooms = [];
    }

    setServer(server: Server)
    {
        this.server = server;
    }

	findUserBy(id: string)
	{

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
            in_game: undefined,
			in_room: undefined,
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

    getRoomById(id: string) : undefined | PongRoom
    {
        return this.rooms.find ((r) => r.id === id);
    }

	getUserFromRefId(ref_id: number): PongUser | undefined
    {
		return (this.users.find((u) => { return u.reference_id === ref_id}))
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

	async removeFromUserList(client: Socket)
    {
        const user : PongUser = await this.getUserFromSocket(client);

        if (user === undefined)
        {
            return console.log("cannot remove user from waiting list: undefined user")
        }
        if (this.waitingPool !== undefined)
        {
			const idx = this.users.findIndex((u) => { return u === user})
			this.users.splice(idx, 1);
			console.log(`removed user ${user.username} from users list`);
        }
    }


	initPlayer(player: PongUser)
	{
		player.position = 0.5;
		player.points = 0;
		player.velocity = 0;
		player.key = 0;
		player.in_game = undefined;
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
            let pool_usr: PongPool = {
                user: user,
                modes: modes,
            };

            this.waitingPool.push(pool_usr);
            this.logger.log("joined waiting room: " + pool_usr.user.username);
			user.socket.emit("IS_SEARCHING_ROOM", true);
            return ;
        }

        console.log("found opponent")
        this.waitingPool.splice(this.waitingPool.indexOf(other), 1);
		this.initPlayer(other.user);
		this.initPlayer(user);
        let room = this.gameService.initRoom(false, other.user, user);
        this.rooms.push(room);
        this.gameService.startRoom(room);
    }

	async stopSearchRoom(user: PongUser, modes: PongModes = PongModes.DEFAULT)
	{
		await this.removeFromWaitingList(user.socket);
		user.socket.emit("IS_SEARCHING_ROOM", false);
	}

	joinRoom(usr: PongUser, id: string)
	{
		const room = this.getRoomById(id);

		if (room === undefined)
		{
			usr.socket.emit("NO_ROOM");
			return ;
		}
		
		room.spectators.push(usr);
		usr.socket.join(room.id);
		usr.in_game = room.id;
		usr.socket.emit("RECONNECT_YOU", {
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
		});

		this.gameService.sendBallUpdate(room);
		this.gameService.sendPlayerUpdate(room);
		usr.socket.emit("START_GAME");

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
			user.in_game = undefined;
            return ;
        }

        if (room !== undefined && room.state === RoomState.PAUSED)
        {
            room.player_1.in_game = undefined;
            room.player_2.in_game = undefined;
            room.state = RoomState.FINISHED;
            //if (room.job_id !== "")
            //    this.boss.offWork(room.job_id);
            //console.log("room ended by disconnection")
            // TODO push room in history
        }
        else if (room !== undefined && room.state !== RoomState.PAUSED)
        {
            room.state = RoomState.PAUSED;
			room.reconnectTimeout = setTimeout(() => {
				room.player_1.in_game = undefined;
				room.player_2.in_game = undefined;
				room.state = RoomState.FINISHED;
				this.server.to(room.id).emit("ROOM_FINISHED", {
                    player_1_score: room.player_1.points,
                    player_2_score: room.player_2.points,
					withdrawal: true,
                } as UpdatePongPointsDTO);
				this.historyService.addGameToHistory({
					ref_id_one: room.player_1.reference_id,
					ref_id_two: room.player_2.reference_id,
					score_one: room.player_1.points,
					score_two: room.player_2.points,
					game_modes: room.options,
					custom: room.custom,
					withdrew: (user.reference_id === room.player_1.reference_id)
						? 1 : 2,
				} as PostFinishedGameDto);
			}, 10000);
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
			if (room.reconnectTimeout)
				clearTimeout(room.reconnectTimeout);
            this.server.to(room.id).emit("PLAYER_RECONNECT");
            user.socket.join(room.id);
            user.socket.emit("RECONNECT_YOU", {
                room_id: room.id,
                options: room.options,
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
                ball2: (room.options & RoomOptions.DOUBLE_BALL) ? {
                    x: room.ball2?.pos_x,
                    y: room.ball2?.pos_y,
                    vel_x: room.ball2?.vel_x,
                    vel_y: room.ball2?.vel_y,
                } : undefined
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
			return (user.in_game !== undefined);

		return (false);
	}


	playerStatus(refId: number)
	{
		const user = this.getUserFromRefId(refId);
		if (user === undefined)
		{
			return {
				connected : false,
				status: "",
			}
		}
		else if (user.in_game !== undefined)
		{
			return {
				connected : true,
				status: "in game",
				id: user.in_game,
			}
		}
		else if (user.in_room !== undefined)
		{
			return  {
				connected : true,
				status: "create room",
				id: user.in_room,
			}
		}
		else
		{
			return {
				connected : false,
				status: "",
			}
		}
	}


	/**
	 *	** CUSTOM ROOMS **
	 */

	findCustomRoomOf(refId : number) : string | undefined
	{
		const us = this.getUserFromRefId(refId);

		if (us === undefined)
			return undefined;
		return us.in_room;
	}

	findCustomRoom(id : string)
	{
		let room = this.customRooms.find((r) => (r.id === id));

		return room;
	}

	isOwner(usr: PongUser, room: CustomRoom) : boolean
	{
		if (room.users.length === 0)
			return false;
		if (room.users[0].reference_id === usr.reference_id)
			return true;
		return false;
	}

	initCustomRoom(id: string, refId: number) : CustomRoom
	{
		this.logger.log(`Init new Custom room ${id}`);
		let room : CustomRoom = {
			id: id,
			users: [],
			opts: RoomOptions.DEFAULT,
		}
		this.customRooms.push(room);
		// review 
		this.chatService.confirmCustomRoom(id, refId);
		return room;
    }

    updateCustomRoom(data: UpdateCustomRoomDTO, client: Socket)
    {
		const room = this.findCustomRoom(data.room_id);
		const usr = this.getUserFromSocket(client);
		if (usr === undefined)
			return ;
		if (this.isOwner(usr, room) === false)
			return ; //error
		
		if (room === undefined)
			return ; //error
        
        if (data.mode === 0)
        {
            room.opts &= ~data.options;
        }
        else
        {
            room.opts |= data.options;
        }

        this.server.to(room.id).emit("CUSTOM_ROOM_UPDATE_MODE", 
        {
            options: data.options,
            mode: data.mode,
        });
    }

	joinCustomRoom(id: string, user: PongUser)
	{
		if (user.in_room !== undefined)
			throw new Error("Already in room !");
		let room = this.findCustomRoom(id);

		if (room === undefined)
			room = this.initCustomRoom(id, user.reference_id);
		
		room.users.push(user);
		user.socket.join(id);

		user.socket.emit("JOINED_CUSTOM_ROOM");
		user.in_room = id;
		this.sendUserOfCustomRoom(id);
		user.socket.emit("CUSTOM_ROOM_UPDATE_MODE", {
			options: room.opts,
            mode: room.opts,
		});
		return;
	}

	leaveCustomRoom(id: string, user: PongUser)
	{
		const room = this.findCustomRoom(id);

		if (room === undefined)
			return ;//throw new Error("Room doesn\'t exist");
		const idx = room.users.findIndex((u) => (u === user));
		room.users.splice(idx, 1);

		user.socket.leave(id);
		user.socket.emit("LEFT_CUSTOM_ROOM");
		user.in_room = undefined;
		this.sendUserOfCustomRoom(id);

		if (room.users.length === 0)
		{
			const i = this.customRooms.indexOf(room);
			this.customRooms.splice(i, 1);
			console.log('Room destroy');
		}
		
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

		if (room === undefined)
			return ;//	throw new Error("Room doesn\'t exist");
		
		console.log(room.users.length);

		const dto = toDto(room.users);
		this.server.to(id).emit("USERS_CUSTOM_ROOM", dto);
		return ;
	}


	startCustomRoom(client: Socket, id : string)
	{

		const croom = this.findCustomRoom(id);
		const usr = this.getUserFromSocket(client);
		if (usr === undefined)
			return ;

		if (croom === undefined)
			return ; //error

		if (croom.users.length < 2)
			return ;// error

		if (this.isOwner(usr, croom) === false)
			return ; //error
		
		const owner = croom.users[0];
		const other = croom.users[1];

		croom.users.splice(0, 2); //rm player
		const room = this.gameService.initRoom(true, owner, other, croom.users, croom.opts);
        room.options = croom.opts;

		// for game options croom.opts //todo
		owner.in_room = undefined;
		other.in_room = undefined;

		for (let u of croom.users)
		{
			u.in_room = undefined;
		}
		this.rooms.push(room);
		this.gameService.startRoom(room);

		const i = this.customRooms.indexOf(croom);
		this.customRooms.splice(i, 1);
		console.log('Room destroy');
	}
}
