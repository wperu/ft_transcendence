import { Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { SendPlayerKeystrokeDTO } from 'src/Common/Dto/pong/SendPlayerKeystrokeDTO';
import { PongRoom } from './interfaces/PongRoom';
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
	{}

	onModuleInit()
	{
		this.logger.log("Module initialized");
	}

	afterInit(server: Server) 
	{
		this.logger.log("Server listening on ");
	}
	
	async handleConnection(client: Socket, ...args: any[]) : Promise<void>
	{
		console.log(`CONNECTION -> ${client.id}`)
		let user : PongUser | undefined = await this.pongService.getUserFromSocket(client);
		
		if (user === undefined)
		{
			user = await this.pongService.connectUserFromSocket(client);
			
			if(user === undefined)
			{
				console.log("Unknown user tried to join the pong");
				client.disconnect();
				return ;
			}
		}
		else if (user.socket.find((s) => { return s.id === client.id}) === undefined)
		{
			user.socket.push(client);
		}

		if (user === undefined)
		{
			this.logger.log(`PONG warning: Unable to retrieve users informations on socket ${client.id}`);
			client.disconnect();
			return ;
		}

		// let the client know that we have authentificated him as a PongUser
		client.emit("AUTHENTIFICATED");
		this.logger.log(`${user.username} connected to the pong under id : ${client.id}`);
	}

	handleDisconnect(client: Socket)
	{
		console.log(`DISCONNECT <- ${client.id}`)
	}


	@SubscribeMessage('SEARCH_ROOM')
	async searchRoom(client: Socket)
	{
		this.pongService.searchRoom(await this.pongService.getUserFromSocket(client));
	}


	@SubscribeMessage("SEND_PLAYER_KEYSTROKE")
	updatePlayerPos(client: Socket, data: SendPlayerKeystrokeDTO)
	{
		this.pongService.updatePlayer(data);
	}
	

	
	
}
