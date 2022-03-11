import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


/** //Todo
 * 	ADD Port to .env
 */
@WebSocketGateway(80, {
	namespace: "chat",
	cors: {
		origin: '*',
	}
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

	
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('AppGateway');

	@SubscribeMessage('message')
	handleMessage(client: Socket, payload: any): string
	{
		return 'ws: Hello world!';
	}
	
	handleConnection(client: Socket, ...args: any[]) : WsResponse<string>
	{
		this.logger.log(`Client connected: ${client.id}`);
		console.log("[Socket io] new connection: " +  client);

		return {
			event: "connection",
			data: "hello world"
		};
	}

	handleDisconnect(client: Socket) {
		console.log("disconnected : " + client.id);
	}
}
