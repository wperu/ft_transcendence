import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { th } from 'date-fns/locale';
import { Server, Socket } from 'socket.io';

/* CONNTECT W/ WSCAT : wscat -c 'ws://localhost:4000/socket.io/chat?EIO=4&transport=websocket'*/

/** //Todo
 * 	ADD Port to .env
 */
@WebSocketGateway(4000, {
	path: "/socket.io/",
	/*namespace: "/chat/", */
	cors: {
		origin: '*',
	},
	transports: ['websocket'] 
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('AppGateway');

	afterInit(server: Server) 
	{
		this.logger.log("Server listening on ");
	}

	@SubscribeMessage('message')
	handleMessage(client: Socket, payload: any): WsResponse<string>
	{
		this.logger.log("[Socket io] new message: " + payload);
		return {
			event: 'message',
			data: payload,
		};
	}

	@SubscribeMessage('error')
	handleError(err: any): void
	{
		this.logger.log('error occured: ' + err);
	}
	
	handleConnection(client: Socket, ...args: any[]) : WsResponse<string>
	{
		this.logger.log(`Client connected: ${client.id}`);

		return {
			event: 'connect',
			data: client.id,
		};
	}

	handleDisconnect(client: Socket)
	{
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
