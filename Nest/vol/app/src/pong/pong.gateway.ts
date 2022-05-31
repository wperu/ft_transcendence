import { Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { randomInt } from 'crypto';
import { Server, Socket } from 'socket.io';
import { SendPlayerKeystrokeDTO } from 'src/Common/Dto/pong/SendPlayerKeystrokeDTO';
import { PongUser } from './interfaces/PongUser';
import { PongService } from './pong.service';

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
		private pongService: PongService
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
				return ;
			}
		}
		
		if (user.in_game && user.socket.connected === false)
		{
			console.log("reconnected user");
			this.pongService.reconnectUser(user, client);
		}
		else if (!user.in_game)
		{
			user.socket = client;
			// let the client know that we have authentificated him as a PongUser
			client.emit("AUTHENTIFICATED");
			this.logger.log(`${user.username} connected to the pong under id : ${client.id}`);
		}
		else
			client.disconnect();
		
	}

	async handleDisconnect(client: Socket)
	{
		let usr = this.pongService.getUserFromSocket(client);
		if (!usr || !usr.in_game)
			this.pongService.removeFromWaitingList(client);
		else
		{
			console.log("disconnecting from game")
			this.pongService.disconnectUser(usr);
		}
		console.log(`DISCONNECT <- ${client.id}`)
	}


	@SubscribeMessage('SEARCH_ROOM')
	async searchRoom(client: Socket)
	{
		const user : PongUser = await this.pongService.getUserFromSocket(client)
		this.pongService.searchRoom(user);
	}


	/*
	@SubscribeMessage("REQUEST_ROOM")
	async requestRoom(client: Socket)
	{
		let room = this.pongService.createMatch(client);

		// pass back room_id to frontend
		client.emit("ROOM_CREATED", {
			room_id: room.id,
		})
	}

	@SubscribeMessage("START_ROOM")
	async startRoom(client: Socket)
	{
		let room = this.pongService.startRoom(client);
	}

	@SubscribeMessage("UPDATE_ROOM")
	async startRoom(client: Socket, data: {

	})
	{
		let room = this.pongService.updateMatch(data);

		// pass back room_id to frontend
		client.emit("ROOM_CREATED", {
			room_id: room.id,
		})
	}

	@SubscribeMessage("INVITE_USER")
	async joinRoom(client: Socket, data: {
		user_id: number
	})
	{
		this.pongService.joinMatch(data.user_id);
	}*/

	@SubscribeMessage("SEND_PLAYER_KEYSTROKE")
	updatePlayerPos(client: Socket, data: SendPlayerKeystrokeDTO)
	{
		this.pongService.updatePlayer(client, data);
	}


	/**
	 * Event to create a cutom room
	 * @param client 
	 * @param data 
	 */
	@SubscribeMessage("CREATE_CUSTOM_ROOM")
	createCustomRoom(client: Socket, data: void)
	{
		//const id: string = generateId();
		const id: string = randomInt(100000).toString();
		console.log('roomcreated ', id);
		client.emit("JOINED_CUSTOM_ROOM", id);
	}
}
