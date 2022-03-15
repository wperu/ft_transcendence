import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { format } from 'date-fns';
import { Server, Socket } from 'socket.io';

enum RoomProtection {
	NONE,
	PROTECTED,
	PRIVATE,
}


// Todo ADD Port to .env
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


	constructor(
		private rooms: {
			name: string,
			protection: RoomProtection,
			owner: Socket,
			users: Array<Socket>,
			password?: string
		}[]
	) { }



	afterInit(server: Server) 
	{
		this.logger.log("Server listening on ");
	}


	/**
	 * Emit to this event to send a message to a room
	 * 
	 * @field message: The message to send to the room
	 * @field room: The room name to send the message to
	 */
	@SubscribeMessage('SEND_MESSAGE')
	handleMessage(client: Socket, payload: {
		message: string,
		room: string
	}) : void
	{
		let msg_obj = {
			message: payload.message,
			sender: "getUserBySocket",
			send_date: format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
		};

		// TODO check if user is actually in room

		/* this.logger.log("[Socket io] new message: " + msg_obj.message); */
		this.server.to(payload.room).emit("RECEIVE_MSG", msg_obj); /* catch RECEIVE_MSG in client */
	}


	/**
	 * Emit to this event to join a room
	 * 
	 * @field name: the room name to join
	 * @field password?: optional, the password of the room to join
	 * 
	 * If the room doesn't exist, the room is created and the user becomes it's owner.
	 * In that case, even if a password is specified, the room protection is set to NONE
	 * upgrade room protection using 'PROTECT_ROOM' event
	 */
	@SubscribeMessage('JOIN_ROOM')
	joinRoom(client: Socket, room: {
		name: string,
		password?: string
	}): void
	{
		let local_room = this.rooms.find(o => o.name === room.name);
		if (local_room === undefined)
		{
			this.rooms.push({
				name: room.name,
				protection: RoomProtection.NONE,
				users: [client],
				owner: client,
			})
		}
		else if (local_room.protection === RoomProtection.NONE)
		{
			local_room.users.push(client);
		}
		else if (local_room.protection === RoomProtection.PRIVATE)
		{
			if (local_room.password === room.password)
				local_room.users.push(client);
			else
				throw new UnauthorizedException("Wrong password");
		}

		this.logger.log(`Client ${client.id} joined room ${room.name}`);
		client.join(room.name);
	}


	// TODO what happens if owner leaves ? 
	/**
	 * Emit to this event to leave a specific room
	 * 
	 * @param room: the room name to leave.
	 */
	@SubscribeMessage('LEAVE_ROOM')
	leaveRoom(client: Socket, room_name: string): void
	{
		let local_room = this.rooms.find(o => o.name === room_name);
		if (local_room === undefined)
		{
			console.error("Left an undefined room ??");
		}
		else
		{
			let user_idx = local_room.users.indexOf(client);
			local_room.users.splice(user_idx, 1);
		}

		this.logger.log(`Client ${client.id} left room ${room_name}`);
		client.leave(room_name);
		if (local_room.users.length === 0)
			this.rooms.splice(this.rooms.indexOf(local_room), 1);
	}



	@SubscribeMessage("INVITE_USER")
	inviteUser(client: Socket, room_invite : {
		room_name: string,
		invited_user: string,

	})
	{

	}



	// TODO protect against proctection disableing from outside
	/**
	 * Emit to this event to set a protection on a room
	 * To be able to edit a room protection, you need to be the owner of that room
	 * 
	 * @field room_name: The name of the room to protect
	 * @field protection_mode: the mode of protection to switch to, available modes are 
	 * 	- "NONE" -> No protection
	 *  - "PROTECTED" -> Invite Only
	 *  - "PRIVATE" -> Password protected (the password MUST be specified in opt parameter)
	 * @field opt: optional field, used to store the password when protection_mode is PRIVATE
	 */
	@SubscribeMessage('PROTECT_ROOM')
	protectRoom(client: Socket, room_protection: {
		room_name: string,
		protection_mode: string,
		opt?: string,
	})
	{
		let local_room = this.rooms.find(o => o.name === room_protection.room_name);
		if (local_room === undefined)
		{
			console.error(`Cannot set protection to unknown room: ${room_protection.room_name}`);
		}

		if (client === local_room.owner)
		{
			switch (room_protection.protection_mode)
			{
				case "NONE":
					local_room.protection = RoomProtection.NONE;
					break;
				case "PROTECTED":
					local_room.protection = RoomProtection.PROTECTED;
					break;
				case "PRIVATE":
					local_room.protection = RoomProtection.PRIVATE;
					if (room_protection["opt"] === undefined)
						throw new BadRequestException("No opt parameter: Cannot set a room protection mode \
to private without sending a password")
					local_room.password = room_protection.opt;
					break;
				default:
					console.log(`Unknown protection mode: ${room_protection.protection_mode}`);
			}
		}
	}


	
	handleConnection(client: Socket, ...args: any[]) : void
	{
		this.logger.log(`Client connected: ${client.id}`);
	}



	handleDisconnect(client: Socket)
	{
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}

