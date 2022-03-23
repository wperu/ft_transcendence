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
		room_name: string
	}) : void
	{
		let msg_obj = {
			message: payload.message,
			sender: "getUserBySocket",
			send_date: format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
			room_name: payload.room_name
		};

		// TODO check if user is actually in room

		/* this.logger.log("[Socket io] new message: " + msg_obj.message); */
		this.server.to(payload.room_name).emit("RECEIVE_MSG", msg_obj); /* catch RECEIVE_MSG in client */
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
	joinRoom(client: Socket, payoad: {
		room_name: string,
		password?: string
	}): void
	{
		let local_room = this.rooms.find(o => o.name === payoad.room_name);
		if (local_room === undefined)
		{
			this.rooms.push({
				name: payoad.room_name,
				protection: RoomProtection.NONE,
				users: [client],
				owner: client,
			})
		}
		else
		{
			let is_user = local_room.users.find(c => c === client);
			if (is_user !== undefined)
				throw new BadRequestException(`Client ${client.id} has aready joined ${payoad.room_name}`)
			
			if (local_room.protection === RoomProtection.NONE)
			{
				local_room.users.push(client);
			}
			else if (local_room.protection === RoomProtection.PRIVATE)
			{
				if (local_room.password === payoad.password)
					local_room.users.push(client);
				else
					throw new UnauthorizedException("Wrong password");
			}
			else 
			{
				throw new UnauthorizedException(`Cannot join room : ${payoad.room_name}`)
			}
		}

		this.logger.log(`Client ${client.id} joined room ${payoad.room_name}`);
		client.join(payoad.room_name);
	}




	// TODO what happens if owner leaves ? 
	/**
	 * Emit to this event to leave a specific room
	 * 
	 * @param room: the room name to leave.
	 */
	@SubscribeMessage('LEAVE_ROOM')
	leaveRoom(client: Socket, payload: string): void
	{
		let local_room = this.rooms.find(o => o.name === payload);
		if (local_room === undefined)
		{
			console.error("Left an undefined room ??");
		}
		else
		{
			let user_idx = local_room.users.indexOf(client);
			local_room.users.splice(user_idx, 1);
		}

		this.logger.log(`Client ${client.id} left room ${payload}`);
		client.leave(payload);
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
	protectRoom(client: Socket, payload: {
		room_name: string,
		protection_mode: string,
		opt?: string,
	})
	{
		let local_room = this.rooms.find(o => o.name === payload.room_name);
		if (local_room === undefined)
		{
			console.error(`Cannot set protection to unknown room: ${payload.room_name}`);
			throw new BadRequestException(`Unknown room ${payload.room_name}`);
		}

		if (client === local_room.owner)
		{
			switch (payload.protection_mode)
			{
				case "NONE":
					local_room.protection = RoomProtection.NONE;
					break;
				case "PROTECTED":
					local_room.protection = RoomProtection.PROTECTED;
					break;
				case "PRIVATE":
					local_room.protection = RoomProtection.PRIVATE;
					if (payload["opt"] === undefined)
						throw new BadRequestException("No opt parameter: Cannot set a room protection mode \
to private without sending a password")
					local_room.password = payload.opt;
					break;
				default:
					console.log(`Unknown protection mode: ${payload.protection_mode}`);
			}
		}
	}


	/**
	 * Emit on this event to change the name of a room
	 * 
	 * @field old_name: the old name of the room that will be changed
	 * @field new_name: the new name for the room
	 */
	@SubscribeMessage('RENAME_ROOM')
	renameRoom(client: Socket, payload: {
		old_name: string,
		new_name: string,
	})
	{
		let local_room = this.rooms.find(o => o.name === payload.old_name);
		if (local_room === undefined)
		{
			console.error(`Cannot rename unknown room: ${payload.old_name}`);
			throw new BadRequestException(`Unknown room ${payload.old_name}`);
		}
		if (client !== local_room.owner)
		{
			throw new UnauthorizedException("Only the room owner can rename the room !");
		}

		let is_new_name = this.rooms.find(o => o.name === payload.new_name);
		if (is_new_name !== undefined)
		{
			console.error(`Cannot rename room ${payload.old_name} to  ${payload.new_name}: A room with that name already exists`);
			throw new BadRequestException(`Bad name: ${payload.new_name} (try again with another name)`);
		}

		local_room.name = payload.new_name;
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

