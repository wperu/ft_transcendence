import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { RoomState } from 'src/Common/Dto/pong/PongRoomDto';
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
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('AppGateway');

	constructor(
		private pongService: PongService
	)
	{}

	@SubscribeMessage('SEARCH_ROOM')
	searchRoom(client: Socket)
	{
		this.pongService.searchRoom(this.pongService.getUserFromSocket(client));
	}

	
	
	handleConnection(client: any, ...args: any[])
	{
		let user : PongUser | undefined = this.pongService.getUserFromSocket(client);
		
		if (user === undefined)
		{
			user = this.pongService.connectUserFromSocket(client);
			if(user === undefined)
			{
				console.log("Unknown user tried to join the pong");
				client.disconnect();
				return ;
			}
		}
		else
		{
			let idx = user.socket.find((s) => { return s.id === client.id})

			if (idx === undefined)
				user.socket.push(client);
		}

		if (user === undefined)
		{
			this.logger.log(`PONG warning: Unable to retrieve users informations on socket ${client.id}`);
			return ;
			
		}

		this.logger.log(`${user.username} connected to the pong under id : ${client.id}`);
	}
	

	
	
		handleDisconnect(client: any)
	{
		
	}
}
