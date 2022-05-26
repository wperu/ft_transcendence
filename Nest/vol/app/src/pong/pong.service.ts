import { ConsoleLogger, Injectable, Logger, Options, SerializeOptions } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { UserToken } from 'src/Common/Dto/User/UserToken';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PongRoom, RoomState } from './interfaces/PongRoom';
import { PongUser } from './interfaces/PongUser';
import { StartPongRoomDTO } from '../Common/Dto/pong/StartPongRoomDTO'
import { PongBall } from './interfaces/PongBall';
import { UpdatePongBallDTO } from 'src/Common/Dto/pong/UpdatePongBallDTO';
import { GameConfig } from 'src/Common/Game/GameConfig';
import { randomInt } from 'crypto';
import { SendPlayerKeystrokeDTO } from 'src/Common/Dto/pong/SendPlayerKeystrokeDTO';
import { UpdatePongPlayerDTO } from 'src/Common/Dto/pong/UpdatePongPlayerDTO';
import { ReconnectPlayerDTO } from 'src/Common/Dto/pong/ReconnectPlayerDTO';
import { PongModes, PongPool } from './interfaces/PongPool';
import * as PgBoss from 'pg-boss';
import { threadId } from 'worker_threads';


// REVIEW do we want multiple socket for pong user ? 

@Injectable()
export class PongService {

    private logger: Logger = new Logger('AppService');

    private GAME_RATE: number = 1000 / 40; // refresh time on server side (about 60fps)

    /*
    private frameCount: number = 0;
    private deltaTime: number = 0;
    private last_time: number = 0;
    private current_time: number = 0;
    */


    private server: Server;

    private boss: PgBoss;



    constructor(
        private usersService: UsersService,
        private users: Array<PongUser>,
        private waitingPool: Array<PongPool>,
        private rooms: Array<PongRoom>,
        private tokenService: TokenService,
    )
    {
        console.log("init pgboss on : postgress://" + process.env.DB_USERNAME + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + "/" + process.env.DB_NAME);
        this.boss = new PgBoss("postgress://" + process.env.DB_USERNAME + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + "/" + process.env.DB_NAME)
        this.boss.on('error', (err) => { return console.log("[pg-boss][error] " + err) })
        this.boss.start();
        this.users = [];
        this.rooms = [];
        this.waitingPool = [];
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

        if (user_info === undefined)
        {
            console.log(`[PONG] Unregistered user in database had access to a valid token : ${socket.id} aborting connection`);
            socket.disconnect();
            return (undefined);
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
        let room = this.initRoom(other.user, user);
        this.rooms.push(room);
        this.startRoom(room);
    }











    async startBoss(room: PongRoom)
    {
        console.log("[boss] start");
      //  room.interval = setInterval(() => this.runRoom(room), this.GAME_RATE);
        
        console.log("[boss] waiting");
        while (room.player_1.in_game !== false
            && room.player_2.in_game !== false)
        {
            await this.runRoom(room)

            if (this.GAME_RATE > room.deltaTime * 1000)
            {
               // console.log("sleeping: ", this.GAME_RATE - room.deltaTime * 1000);
                await new Promise(res => {
                    return setTimeout(res, this.GAME_RATE - room.deltaTime * 1000)
                })
            }
        }

        console.log("[boss] ended");
        room.state = RoomState.FINISHED;
        /*if (room.interval !== undefined)
        {
            clearInterval(room.interval);
            console.log("cleared interval");
        }*/

        this.boss.offWork(room.id);

        this.logger.log("Room ended");
        // TODO push room in history 
        return ;
    }












    initRoom(creator: PongUser, other: PongUser = undefined) : PongRoom
    {
        function generateID() {
            return ('xxxxxxxxxxxxxxxx'.replace(/[x]/g, (c) => {  
                const r = Math.floor(Math.random() * 16);  
                return r.toString(16);  
            }));
        }

        let room_id = generateID();
        creator.socket.join(room_id);
        other.socket.join(room_id);

        return ({
            id: room_id,
            player_1: creator,
            player_2: other,
            ball: {
                pos_x: 1,
                pos_y: 0.5,
                vel_x: randomInt(1) > 0.5 ? -GameConfig.BALL_SPEED : GameConfig.BALL_SPEED,
                vel_y: randomInt(-100, 100) / 1000
            } as PongBall,
            spectators: [],
            state: RoomState.WAITING,

            currentTime: 0,
            deltaTime: 0,
            lastTime: 0,
            frameCount: 0,
        });
    }



    async reloadRoom(room: PongRoom)
    {
        this.server.to(room.id).emit("END_GAME");
        console.log("ending");

        const sleep = async () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(2)
                }, GameConfig.RELOAD_TIME)
            })
        }

        await sleep();

        room.ball.pos_x = 1;
        room.ball.pos_y = 0.5;
        room.ball.vel_x = randomInt(1) > 0.5 ? -GameConfig.BALL_SPEED : GameConfig.BALL_SPEED,
        room.ball.vel_y = randomInt(-100, 100) / 1000
        room.player_1.position = 0.5;
        room.player_2.position = 0.5;
        room.player_1.key = 0;
        room.player_2.key = 0;
        this.server.to(room.id).emit("LOAD_GAME");
        console.log("[reload] loading");
        this.sendBallUpdate(room);
        this.sendPlayerUpdate(room);

        await sleep();

        console.log("[reload] starting");
        this.server.to(room.id).emit("START_GAME");
        room.lastTime = 0;

        console.log("RELOAD ENDED");
    }



    async startRoom(room: PongRoom)
    {
        let starting_obj: StartPongRoomDTO = {
            room_id: room.id,

            player_1: {
                username: room.player_1.username,
            },

            player_2: {
                username: room.player_2.username,
            }
        }
        room.player_1.in_game = true;
        room.player_2.in_game = true;

        room.state = RoomState.PLAYING;
        this.server.to(room.id).emit('STARTING_ROOM', starting_obj);

        console.log("START -> sent room start request");

        new Promise(async () => setTimeout(async () => {
            console.log("loading");
            this.server.to(room.id).emit("LOAD_GAME");
            console.log("START -> sent load request");
            await new Promise(async () => setTimeout(async () => {
                console.log("starting");
                this.sendBallUpdate(room);
                this.sendPlayerUpdate(room);
                console.log("START -> sent start request");
                this.server.to(room.id).emit("START_GAME");
                room.lastTime = 0;


               // room.interval = setInterval(() => this.runRoom(room), this.GAME_RATE);
                let boss_id = await this.boss.send(room.id, {});
                console.log("[boss] starting job: " + boss_id);
                this.boss.work(room.id, {
                    teamSize: 10,
                    teamConcurrency: 10,
                },() => this.startBoss(room))
                .catch((error) => {
                    console.log(error);
                })
                .then(() => {
                    console.log("[boss] job ended");
                });
            }, GameConfig.RELOAD_TIME));
        }, GameConfig.RELOAD_TIME));
    }



    async runRoom(room: PongRoom) : Promise<void>
    {
        if (room.state !== RoomState.PAUSED)
            await this.updateRoom(room);
    }


















    async updateRoom(room: PongRoom)
    {
        /* calulating delta time between frames */
        room.currentTime = performance.now();
        if (room.lastTime === 0)
            room.lastTime = room.currentTime;
        room.deltaTime = (room.currentTime - room.lastTime) * 0.001;
        room.lastTime = room.currentTime;

        /* Logic update */
        await this.gameUpdate(room);

        if (room.frameCount === 0)
            this.sendBallUpdate(room);
        
        /* Increment frame Count */
        room.frameCount++;
    }



    sendBallUpdate(room: PongRoom)
    {
        let ball_infos: UpdatePongBallDTO = {
            ball_x: room.ball.pos_x,
            ball_y: room.ball.pos_y,
            vel_x: room.ball.vel_x,
            vel_y: room.ball.vel_y,
        };
        this.server.to(room.id).emit('UPDATE_PONG_BALL',  ball_infos);
    }


    sendPlayerUpdate(room: PongRoom)
    {
        this.server.to(room.id).emit('UPDATE_PONG_PLAYER', {
            player_id: 2,
            position: room.player_2.position,
            velocity: room.player_2.velocity,
            key: room.player_2.key,
        } as UpdatePongPlayerDTO);    

        this.server.to(room.id).emit('UPDATE_PONG_PLAYER', {
            player_id: 1,
            position: room.player_1.position,
            velocity: room.player_1.velocity,
            key: room.player_1.key,
        } as UpdatePongPlayerDTO);
    }



    async updatePlayer(client: Socket, data: SendPlayerKeystrokeDTO)
    {
        let room = this.rooms.find ((r) => r.id === data.room_id);
        let user = this.getUserFromSocket(client);

        if (room === undefined)
        {
            console.log(`cannot update undefined room with id: ${data.room_id}`);
            return ;
        }

        if (user === undefined)
        {
            console.log(`cannot update undefined user`);
            return ;
        }

        // REVIEW unique socket or username ?
        if (user.username === room.player_1.username)
        {
            if (data.state === 0)
                room.player_1.key = 0;
            else
                room.player_1.key = data.key === 1 ? -1 : 1;
        }
        else if (user.username === room.player_2.username)
        {
            if (data.state === 0)
                room.player_2.key = 0;
            else
                room.player_2.key = data.key === 1 ? -1 : 1;
        }

        this.updateRoom(room);
        this.sendPlayerUpdate(room);
    }












    /* REVIEW Game logic here, maybe rewrap this into another service */
    async gameUpdate(room: PongRoom)
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
        let terrain_sx = 2, terrain_sy = 1;
        //console.log("updating");

        /* Calculating next frame velocities */
        // ball
        if ((room.ball.pos_y > terrain_sy - GameConfig.BALL_SIZE * 0.5 && room.ball.vel_y > 0)
          || (room.ball.pos_y < GameConfig.BALL_SIZE * 0.5 && room.ball.vel_y < 0))
        {
            room.ball.vel_y *= -1;
            this.sendBallUpdate(room);
        }

        if (room.ball.pos_x > terrain_sx || room.ball.pos_x < 0)
        {
            // TODO points
            await this.reloadRoom(room);
            return ;
        }


        // player
        if (room.player_1.key !== 0)
            room.player_1.velocity = room.player_1.key * GameConfig.PLAYER_SPEED
        else 
            room.player_1.velocity *= GameConfig.PLAYER_FRICTION;

        if (room.player_2.key !== 0)
            room.player_2.velocity = room.player_2.key * GameConfig.PLAYER_SPEED;
        else 
            room.player_2.velocity *= GameConfig.PLAYER_FRICTION;


        // ball collision with player
        if (room.ball.vel_x < 0
            && room.ball.pos_x > GameConfig.TERRAIN_PADDING_X
            && room.ball.pos_x < GameConfig.TERRAIN_PADDING_X + GameConfig.BALL_SIZE
            && room.ball.pos_y > room.player_1.position - GameConfig.PLAYER_SIZE * 0.5
            && room.ball.pos_y < room.player_1.position + GameConfig.PLAYER_SIZE * 0.5)
        {
            let sweep_dir = ((room.ball.pos_y - room.player_1.position) / GameConfig.PLAYER_SIZE)
            let sweep_force = room.player_1.velocity * 0.5;
            room.ball.vel_y += (sweep_dir + sweep_force) * GameConfig.PLAYER_SWEEP_FORCE;
            room.ball.vel_x *= -1;
            this.sendBallUpdate(room);
        }
        

        if (room.ball.vel_x > 0
            && room.ball.pos_x < 2.0
            && room.ball.pos_x > 2.0 - GameConfig.TERRAIN_PADDING_X - GameConfig.BALL_SIZE
            && room.ball.pos_y > room.player_2.position - GameConfig.PLAYER_SIZE * 0.5
            && room.ball.pos_y < room.player_2.position + GameConfig.PLAYER_SIZE * 0.5)
        {
            let sweep_dir = ((room.ball.pos_y - room.player_2.position) / GameConfig.PLAYER_SIZE)
            let sweep_force = room.player_2.velocity * 0.5;
            room.ball.vel_y += (sweep_dir + sweep_force) * GameConfig.PLAYER_SWEEP_FORCE;
            room.ball.vel_x *= -1;
            this.sendBallUpdate(room);
        }
        

        /* Updating positions */
       room.ball.pos_x += room.ball.vel_x * room.deltaTime;
       room.ball.pos_y += room.ball.vel_y * room.deltaTime;
       room.player_1.position += room.player_1.velocity * room.deltaTime;
       room.player_2.position += room.player_2.velocity * room.deltaTime;


        /* Player wall collisions */
        // 1
        if (room.player_1.position < GameConfig.TERRAIN_PADDING_Y)
        {
            room.player_1.velocity = 0;
            room.player_1.position = GameConfig.TERRAIN_PADDING_Y;
        }

        if (room.player_1.position > 1 - GameConfig.TERRAIN_PADDING_Y)
        {
            room.player_1.velocity = 0;
            room.player_1.position = 1 - GameConfig.TERRAIN_PADDING_Y;
        }

        // 2
        if (room.player_2.position < GameConfig.TERRAIN_PADDING_Y)
        {
            room.player_2.velocity = 0;
            room.player_2.position = GameConfig.TERRAIN_PADDING_Y;
        }

        if (room.player_2.position > 1 - GameConfig.TERRAIN_PADDING_Y)
        {
            room.player_2.velocity = 0;
            room.player_2.position = 1 - GameConfig.TERRAIN_PADDING_Y;
        }

        if (room.frameCount % 60)
            this.sendBallUpdate(room);
    }
















    async disconnectUser(user: PongUser)
    {
        let room: PongRoom = this.rooms.find((r) => {
            return r.player_1.reference_id === user.reference_id || r.player_2.reference_id === user.reference_id
        });

        if (room !== undefined && room.state === RoomState.PAUSED)
        {
            room.player_1.in_game = false;
            room.player_2.in_game = false;
            room.state = RoomState.FINISHED;
            await this.boss.offWork(room.id);
            // TODO push room in history
        }
        else if (room !== undefined && room.state !== RoomState.PAUSED)
        {
            room.state = RoomState.PAUSED;
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
                this.sendBallUpdate(room);
                this.sendPlayerUpdate(room);
                this.server.to(room.id).emit("START_GAME");
                room.lastTime = 0;




                //room.interval = setInterval(() => this.runRoom(room), this.GAME_RATE);
                this.startBoss(room);


            }, GameConfig.RELOAD_TIME));
        }
    }
}