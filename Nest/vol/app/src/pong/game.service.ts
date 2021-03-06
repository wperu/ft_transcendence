import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PongRoom, RoomState } from './interfaces/PongRoom';
import { PongUser } from './interfaces/PongUser';
import { StartPongRoomDTO } from '../Common/Dto/pong/StartPongRoomDTO'
import { PongBall } from './interfaces/PongBall';
import { UpdatePongBallDTO } from 'src/Common/Dto/pong/UpdatePongBallDTO';
import { GameConfig } from 'src/Common/Game/GameConfig';
import { randomInt } from 'crypto';
import { SendPlayerKeystrokeDTO } from 'src/Common/Dto/pong/SendPlayerKeystrokeDTO';
import { UpdatePongPlayerDTO } from 'src/Common/Dto/pong/UpdatePongPlayerDTO';
import { PongService } from './pong.service';
import * as PgBoss from 'pg-boss';
import { UpdatePongPointsDTO } from 'src/Common/Dto/pong/UpdatePongPointsDTO';
import { GameHistoryService } from 'src/game-history/game-history.service';
import { PostFinishedGameDto } from 'src/Common/Dto/pong/FinishedGameDto';
import { RoomOptions } from 'src/Common/Game/GameConfig';

@Injectable()
export class GameService {

    private boss: PgBoss;

    private GAME_RATE: number = 1000 / 60; // refresh time on server side (about 60fps)

	private TERRAIN_SX: number = 2;
	private TERRAIN_SY: number = 1;

    private logger: Logger = new Logger('GameService');

    private server: Server;


    constructor(
        @Inject(forwardRef(() => PongService))
        private pongService: PongService,
        private historyService: GameHistoryService

    )
    {
        this.logger.log("init pgboss on : postgress://" + process.env.DB_USERNAME + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + "/" + process.env.DB_NAME);
        this.boss = new PgBoss("postgress://" + process.env.DB_USERNAME + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + "/" + process.env.DB_NAME)
        this.boss.on('error', (err) => { return this.logger.error("[pg-boss][error] " + err) })
        this.boss.start();
    }


    setServer(server: Server)
    {
        this.server = server;
    }



    async startBoss(room: PongRoom)
    {
        while (room.player_1.in_game !== undefined
            && room.player_2.in_game !== undefined)
        {
            await this.runRoom(room)

            let t = performance.now();
            if (this.GAME_RATE > t - room.lastTime)
            {
			   	await new Promise(res => {
                    return setTimeout(res, this.GAME_RATE - (t - room.lastTime))
                })
            }
        }

        room.state = RoomState.FINISHED;

		const job_id	= room.job_id;
    

		this.pongService.removeRoom(room);
		if (job_id !== "")
			this.boss.offWork(job_id);

        this.logger.log(`Room ${room.id} ended (${room.player_1.username} vs ${room.player_2.username})`);

		if (room.withdrawal < 3)
		{
			this.historyService.addGameToHistory({
				ref_id_one: room.player_1.reference_id,
				ref_id_two: room.player_2.reference_id,
				score_one: room.player_1.points,
				score_two: room.player_2.points,
				game_modes: room.options,
				custom: room.custom,
				withdrew: room.withdrawal,
			} as PostFinishedGameDto);
		}

        return ;
    }






    initRoom(is_custom: boolean, creator: PongUser,
        other: PongUser = undefined, spectators : Array<PongUser> = [],
        options: number = 0) : PongRoom
    {
        function generateID() {
            return ('xxxxxxxxxxxxxxxx'.replace(/[x]/g, (c) => {  
                const r = Math.floor(Math.random() * 16); 
                return r.toString(16);
            }));
        }

       
		let room_id = generateID();
		while (this.pongService.getRoomById(room_id) !== undefined)
			room_id = generateID();

        creator.socket.join(room_id);
        other.socket.join(room_id);

		spectators.forEach((u) => {
			u.socket.join(room_id);
		});
		creator.points = 0;
		other.points = 0;
		creator.position = 0.5;
		other.position = 0.5;

        let ball = {
            pos_x: 1,
            pos_y: 0.5,
            vel_x: randomInt(10) > 5 ? -GameConfig.BALL_SPEED : GameConfig.BALL_SPEED,
            vel_y: randomInt(-100, 100) / 1000
        } as PongBall;

        let ball2: PongBall | undefined = undefined
        if (options & RoomOptions.DOUBLE_BALL)
        {
            ball2 = {
                pos_x: 1,
                pos_y: 0.5,
                vel_x: -ball.vel_x,
                vel_y: randomInt(-100, 100) / 1000
            } as PongBall 
        }

        this.logger.log(`Created room with id : ${room_id}`);
        return ({
            id: room_id,
            job_id: "",
            player_1: creator,
            player_2: other,
            ball: ball,
            ball2: ball2,
            spectators: spectators,
            state: RoomState.WAITING,
            reconnectTimeout: null,

            options: RoomOptions.DEFAULT,
            custom: is_custom,
            currentTime: 0,
            deltaTime: 0,
            lastTime: 0,
            frameCount: 0,
            endScore: GameConfig.DEFAULT_MAX_SCORE,
			withdrawal: 0,
        });
    }



    async reloadRoom(room: PongRoom)
    {
        this.server.to(room.id).emit("END_GAME");

        const sleep = async () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(2)
                }, GameConfig.RELOAD_TIME)
            })
        }

        await sleep();
        if (room.state === RoomState.PLAYING)
        {
            room.ball.pos_x = 1;
            room.ball.pos_y = 0.5;
            room.ball.vel_x = randomInt(10) > 5 ? -GameConfig.BALL_SPEED : GameConfig.BALL_SPEED,
            room.ball.vel_y = randomInt(-100, 100) / 1000
            room.player_1.position = 0.5;
            room.player_2.position = 0.5;
            room.player_1.key = 0;
            room.player_2.key = 0;
        }

        if (room.ball2 !== undefined)
        {
            room.ball2.pos_x = 1;
            room.ball2.pos_y = 0.5;
            room.ball2.vel_x = -room.ball.vel_x;
            room.ball2.vel_y = randomInt(-100, 100) / 1000
        }

        if (room.state === RoomState.PLAYING)
        {
            this.server.to(room.id).emit("LOAD_GAME");
            this.sendBallUpdate(room);
            this.sendPlayerUpdate(room);
            await sleep();
        }
        // is still playing ?
        if (room.state === RoomState.PLAYING)
        {
            this.server.to(room.id).emit("START_GAME");
        }

        room.lastTime = 0;
    }



    async startRoom(room: PongRoom)
    {
        let starting_obj: StartPongRoomDTO = {
            room_id: room.id,
            options: room.options,

            player_1: {
                username: room.player_1.username,
            },

            player_2: {
                username: room.player_2.username,
            }
        }
        room.player_1.in_game = room.id;
        room.player_2.in_game = room.id;

        room.state = RoomState.PLAYING;
        this.server.to(room.id).emit('STARTING_ROOM', starting_obj);
        this.logger.log(`Starting room ${room.id} (${room.player_1.username} vs ${room.player_2.username})`);

        new Promise(async () => setTimeout(async () => {
            this.server.to(room.id).emit("LOAD_GAME");
            await new Promise(async () => setTimeout(async () => {
                this.sendBallUpdate(room);
                this.sendPlayerUpdate(room);
                this.server.to(room.id).emit("START_GAME");
                room.lastTime = 0;

                room.job_id = await this.boss.send(room.id, {});
                this.boss.work(room.id, {
                    teamSize: 10,
                    teamConcurrency: 10,
                },() => this.startBoss(room))

            }, GameConfig.RELOAD_TIME));
        }, GameConfig.RELOAD_TIME));

		
    }

    async runRoom(room: PongRoom) : Promise<void>
    {
        if (room.state !== RoomState.PAUSED && room.state !== RoomState.FINISHED)
            await this.updateRoom(room);
        else if (room.state === RoomState.PAUSED)
        {
            while (room.state === RoomState.PAUSED)
            {
                await new Promise(res => {
                    return (setTimeout(res, 200));
                })
            }
        }
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
        if (room.options & RoomOptions.DOUBLE_BALL && room.ball2 !== undefined)
        {
            let ball_infos: UpdatePongBallDTO = {
                ball_x: room.ball.pos_x,
                ball_y: room.ball.pos_y,
                vel_x: room.ball.vel_x,
                vel_y: room.ball.vel_y,

                ball2: {
                    ball_x: room.ball2.pos_x,
                    ball_y: room.ball2.pos_y,
                    vel_x: room.ball2.vel_x,
                    vel_y: room.ball2.vel_y,
                }
            };
            this.server.to(room.id).emit('UPDATE_PONG_BALL',  ball_infos);
        }
        else
        {
            let ball_infos: UpdatePongBallDTO = {
                ball_x: room.ball.pos_x,
                ball_y: room.ball.pos_y,
                vel_x: room.ball.vel_x,
                vel_y: room.ball.vel_y,
            };
            this.server.to(room.id).emit('UPDATE_PONG_BALL',  ball_infos);
    
        }
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
        let room = this.pongService.getRoomById(data.room_id);
        let user = this.pongService.getUserFromSocket(client);

        if (room === undefined)
        {
            this.logger.error(`cannot update undefined room with id: ${data.room_id}`);
            return ;
        }

        if (user === undefined)
        {
            this.logger.error(`cannot update undefined user`);
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

       // this.gameUpdate(room);
	   this.playerUpdate(room);
       this.sendPlayerUpdate(room);
    }




	playerUpdate(room: PongRoom)
	{
		if (room.player_1.key !== 0)
        {
            if (room.options & RoomOptions.ICE_FRICTION && room.player_1.velocity < GameConfig.PLAYER_SPEED)
            {
                room.player_1.velocity += room.player_1.key * room.deltaTime;
            }
            else
                room.player_1.velocity = room.player_1.key * GameConfig.PLAYER_SPEED;
        }
        else 
        {
            if (room.options & RoomOptions.ICE_FRICTION)
            {
                room.player_1.velocity *= GameConfig.PLAYER_FRICTION_ON_ICE;
                if  ((room.player_1.position < GameConfig.TERRAIN_PADDING_Y)
                ||  (room.player_1.position > 1 - GameConfig.TERRAIN_PADDING_Y))
                    room.player_1.velocity *= -1;
                this.sendPlayerUpdate(room);
            }
            else
                room.player_1.velocity *= GameConfig.PLAYER_FRICTION;
        }

		if (room.player_2.key !== 0)
        {
            if (room.options & RoomOptions.ICE_FRICTION && room.player_2.velocity < GameConfig.PLAYER_SPEED)
            {
                room.player_2.velocity += room.player_2.key * room.deltaTime;
            }
            else
                room.player_2.velocity = room.player_2.key * GameConfig.PLAYER_SPEED;
        }
		else 
        {
            if (room.options & RoomOptions.ICE_FRICTION)
            {
			    room.player_2.velocity *= GameConfig.PLAYER_FRICTION_ON_ICE;
                if  ((room.player_2.position < GameConfig.TERRAIN_PADDING_Y)
                ||  (room.player_2.position > 1 - GameConfig.TERRAIN_PADDING_Y))
                    room.player_2.velocity *= -1;
                this.sendPlayerUpdate(room);
            }
            else
			    room.player_2.velocity *= GameConfig.PLAYER_FRICTION;
        }

		room.player_1.position += room.player_1.velocity * room.deltaTime;
		room.player_2.position += room.player_2.velocity * room.deltaTime;

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
	}



	async ballUpdate(room: PongRoom, ball: PongBall)
	{
		if ((ball.pos_y > this.TERRAIN_SY - GameConfig.BALL_SIZE * 0.5 && ball.vel_y > 0)
		|| (ball.pos_y < GameConfig.BALL_SIZE * 0.5 && ball.vel_y < 0))
		{
			ball.vel_y *= -1;
			this.sendBallUpdate(room);
		}

		if (ball.pos_x > this.TERRAIN_SX || ball.pos_x < 0)
		{
            if (ball.pos_x < 0)
                room.player_2.points++;
            else
                room.player_1.points++;
            if (room.endScore === room.player_1.points || room.endScore === room.player_2.points)
            {
                this.server.to(room.id).emit("ROOM_FINISHED", {
                    player_1_score: room.player_1.points,
                    player_2_score: room.player_2.points,
                    withdrawal: false,
                } as UpdatePongPointsDTO)
               /* this.historyService.addGameToHistory({
					ref_id_one: room.player_1.reference_id,
					ref_id_two: room.player_2.reference_id,
					score_one: room.player_1.points,
					score_two: room.player_2.points,
					game_modes: room.options,
					custom: room.custom,
					withdrew: 0
				} as PostFinishedGameDto); */
                room.player_1.in_game = undefined;
                room.player_2.in_game = undefined;
                room.state = RoomState.FINISHED;
            }
            else
            {
                this.server.to(room.id).emit("UPDATE_POINTS", {
                    player_1_score: room.player_1.points,
                    player_2_score: room.player_2.points,
                    withdrawal: undefined,
                } as UpdatePongPointsDTO)
                await this.reloadRoom(room);
            }
			return ;
		}

		// ball collision with player
		if (ball.vel_x < 0
		  && ball.pos_x > GameConfig.TERRAIN_PADDING_X
		  && ball.pos_x < GameConfig.TERRAIN_PADDING_X + GameConfig.BALL_SIZE
		  && ball.pos_y > room.player_1.position - GameConfig.PLAYER_SIZE * 0.5
		  && ball.pos_y < room.player_1.position + GameConfig.PLAYER_SIZE * 0.5)
		{
			let sweep_dir = ((ball.pos_y - room.player_1.position) / GameConfig.PLAYER_SIZE)
			let sweep_force = room.player_1.velocity * 0.5;
			ball.vel_y += (sweep_dir + sweep_force) * GameConfig.PLAYER_SWEEP_FORCE;
			ball.vel_x *= -1;
			this.sendBallUpdate(room);
		}
		else if (ball.vel_x > 0
		  && ball.pos_x < 2.0
		  && ball.pos_x > 2.0 - GameConfig.TERRAIN_PADDING_X - GameConfig.BALL_SIZE
		  && ball.pos_y > room.player_2.position - GameConfig.PLAYER_SIZE * 0.5
		  && ball.pos_y < room.player_2.position + GameConfig.PLAYER_SIZE * 0.5)
		{
			let sweep_dir = ((ball.pos_y - room.player_2.position) / GameConfig.PLAYER_SIZE)
			let sweep_force = room.player_2.velocity * 0.5;
			ball.vel_y += (sweep_dir + sweep_force) * GameConfig.PLAYER_SWEEP_FORCE;
			ball.vel_x *= -1;
			this.sendBallUpdate(room);
		}

		/* Updating positions */
		ball.pos_x += ball.vel_x * room.deltaTime;
		ball.pos_y += ball.vel_y * room.deltaTime;
	}



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

		await this.ballUpdate(room, room.ball);

        if (room.options & RoomOptions.DOUBLE_BALL) 
            await this.ballUpdate(room, room.ball2);
		this.playerUpdate(room);
    }
}