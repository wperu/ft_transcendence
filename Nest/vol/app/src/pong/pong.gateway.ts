import { forwardRef, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { randomInt } from 'crypto';
import { Server, Socket } from 'socket.io';
import { SendPlayerKeystrokeDTO } from 'src/Common/Dto/pong/SendPlayerKeystrokeDTO';
import { GameService } from './game.service';
import { PongUser } from './interfaces/PongUser';
import { PongService } from './pong.service';
import { UpdateCustomRoomDTO } from '../Common/Dto/pong/UpdateCustomRoomDTO'  

@WebSocketGateway(+process.env.WS_CHAT_PORT, {
	path: "/socket.io/",
	namespace: "/pong",
	cors: {
		origin: '*',
	},
	transports: ['websocket'] 
})
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, OnModuleInit
{
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('PongGateway');

	constructor(
		@Inject(forwardRef(() => PongService))
		private pongService: PongService,
		@Inject(forwardRef(() => GameService))
		private gameService: GameService
	)
	{
	}

	onModuleInit()
	{
		this.logger.log("Module initialized");
	}

	afterInit(server: Server) 
	{
		this.logger.log("Server listening on ");
		this.pongService.setServer(server);
		this.gameService.setServer(server);
	}
	
	async handleConnection(client: Socket, ...args: any[]) : Promise<void>
	{
		console.log(`CONNECTION -> ${client.id}`)
		let user : PongUser | undefined = this.pongService.getUserFromSocket(client);
		
		if (user === undefined)
		{
			user = await this.pongService.registerUserFromSocket(client);
			
			if(user === undefined)
			{
				console.log("Unknown user tried to join the pong");
				client.disconnect();
			}
			else
				client.emit("AUTHENTIFICATED");
			return ;
		}
		
		if (user.in_game && user.socket.connected === false) //In room
		{
			console.log("reconnected user");
			this.pongService.reconnectUser(user, client);
		}
		else if (!user.in_game && user.socket.connected === false)
		{
			user.socket = client;
			// let the client know that we have authentificated him as a PongUser
			client.emit("AUTHENTIFICATED");
			this.logger.log(`${user.username} connected to the pong under id : ${client.id}`);
		}
		else
		{
			this.logger.log(`${user.username} already connected to the pong under id : ${client.id}`);
			client.disconnect();
		}
	}

	async handleDisconnect(client: Socket)
	{
		this.logger.log("Rcv DISCONNECT");
		let usr = this.pongService.getUserFromSocket(client);
		if (!usr || !usr.in_game)
			this.pongService.removeFromWaitingList(client);
		else
		{
			console.log("disconnecting from game")
			this.pongService.disconnectUser(usr);		
		}
		if (usr && usr.in_room !== undefined)
				this.pongService.leaveCustomRoom(usr.in_room, usr);
		if (usr && !usr.in_room && !usr.in_game)
		{
			this.pongService.removeFromUserList(client);
		}
		console.log(`DISCONNECT <- ${client.id}`)
	}

	@SubscribeMessage('SEARCH_ROOM')
	async searchRoom(client: Socket)
	{
		const user : PongUser = await this.pongService.getUserFromSocket(client)
		this.pongService.searchRoom(user);
	}

	@SubscribeMessage('STOP_SEARCH_ROOM')
	async stopSearchRoom(client: Socket)
	{
		const user : PongUser = await this.pongService.getUserFromSocket(client)
		this.pongService.stopSearchRoom(user);
	}

	@SubscribeMessage('JOIN_ROOM')
	async joinRoom(client: Socket, id: string)
	{
		const user : PongUser = await this.pongService.getUserFromSocket(client)
		this.pongService.joinRoom(user, id);
	}

	@SubscribeMessage("SEND_PLAYER_KEYSTROKE")
	updatePlayerPos(client: Socket, data: SendPlayerKeystrokeDTO)
	{
		this.gameService.updatePlayer(client, data);
	}



	/**
	 * ** *** CUSTOM ROOM *** **
	 */

	@SubscribeMessage("CREATE_CUSTOM_ROOM")
	createCustomRoom(client: Socket, data: void)
	{
		function generateID() {
			return ('xxxxxxxxxxxxxxxx'.replace(/[x]/g, (c) => {  
				const r = Math.floor(Math.random() * 16); 
				return r.toString(16);  
			}));
		}
		
		let id = generateID();
		while (this.pongService.findCustomRoom(id) !== undefined)
			id = generateID();

		let usr = this.pongService.getUserFromSocket(client);

		if (usr !== undefined && usr.in_room !== undefined)
			client.emit("UP_CUSTOM_ROOM", usr.in_room);
		else
			client.emit("UP_CUSTOM_ROOM", id);
		console.log('roomcreated ', id);
	}

	@SubscribeMessage("JOIN_CUSTOM_ROOM")
	joinCustomRoom(client: Socket, room_id: string)
	{
		this.logger.log("Rcv JOIN_CUSTOM_ROOM");
		let usr = this.pongService.getUserFromSocket(client);

		this.pongService.joinCustomRoom(room_id, usr);
	}

	@SubscribeMessage("LEAVE_CUSTOM_ROOM")
	leaveCustomRoom(client: Socket, room_id: string)
	{
		this.logger.log("Rcv LEAVE_CUSTOM_ROOM");
		let usr = this.pongService.getUserFromSocket(client);

		this.pongService.leaveCustomRoom(room_id, usr);
	}

	@SubscribeMessage("UPDATE_CUSTOM_ROOM")
	updateCustomRoom(client: Socket, data: UpdateCustomRoomDTO)
	{
		this.pongService.updateCustomRoom(data)
	}

	@SubscribeMessage("START_CUSTOM_ROOM")
	startCustomRoom(client: Socket, room_id: string)
	{
		this.logger.log("Rcv START_CUSTOM_ROOM");
		this.pongService.startCustomRoom(client, room_id);
	}
}
