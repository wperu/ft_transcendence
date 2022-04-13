import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { format } from 'date-fns';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { ChatUser } from 'src/chat/interface/chat_user.d';
import { User } from 'src/entities/user.entity';
import { useContainer } from 'typeorm';
import { isInt8Array } from 'util/types';
import { create_room,room_protect, RoomProtection, RoomLeftDto, RoomMuteDto, RoomPromoteDto, RoomBanDto} from '../Common/Dto/chat/room';
//import { RoomProtection } from 'src/Common/Dto/chat/RoomProtection.d';
import room_invite from '../Common/Dto/chat/room_invite';
import room_join from '../Common/Dto/chat/room_join';
import {room_rename,room_change_pass} from '../Common/Dto/chat/room_rename';
import { ChatService } from './chat.service';
import {room} from "./interface/room";


// Todo fix origin
@WebSocketGateway(+process.env.WS_CHAT_PORT, {
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
		private chatService: ChatService,
		private rooms: room[]
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
		let user: ChatUser = this.chatService.getUserFromSocket(client);
		let msg_obj = {
			message: payload.message,
			sender: user.username,
			send_date: format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
			room_name: payload.room_name
		};

		// TODO check if user is actually in room           
		// TODO maybe store in DB if we want chat history ? 

		this.logger.log("[Socket io] new message: " + msg_obj.message);
		this.server.to(payload.room_name).emit("RECEIVE_MSG", msg_obj); /* catch RECEIVE_MSG in client */
	}




	@SubscribeMessage('CREATE_ROOM')
	createRoom(client: Socket, payload: create_room): void 
	{
		let local_room = this.rooms.find(o => o.name === payload.room_name);
		if (local_room === undefined)
		{
			this.rooms.push({
				name: payload.room_name,
				protection: payload.proctection,
				users: [client],
				invited : [],
				muted: [],
				owner: client,
			})

			//todo join & add client to room
			client.join(payload.room_name);
			client.emit("JOINED_ROOM", { status: 0, room_name: payload.room_name });
		}
		else
		{
			throw new BadRequestException(`room exist impossible create with same name`)	
		}
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
	joinRoom(client: Socket, payoad: room_join): void
	{
		let local_room = this.rooms.find(o => o.name === payoad.room_name);
		if (local_room === undefined)
		{
			client.emit("JOINED_ROOM", { status: 1, status_message: " no such room" });
			this.logger.log(`[${client.id}] Cannot join room: ${payoad.room_name}: no such room`);
			return ;
		}
		else
		{
			/* Already joined check */
			let is_user = local_room.users.find(c => c === client);
			if (is_user !== undefined)
			{
				client.emit("JOINED_ROOM", { status: 1, status_message: " you are already in that room" });
				this.logger.log(`[${client.id}] Cannot join room: ${payoad.room_name}: Client ${client.id} has already joined room`);
				return ;
			}
			
			/* Protection check */
			if (local_room.protection === RoomProtection.NONE)
			{
				local_room.users.push(client);
			}
			else if (local_room.protection === RoomProtection.PROTECTED)
			{
				if (local_room.password === payoad.password)
					local_room.users.push(client);
				else
				{
					client.emit("JOINED_ROOM", { status: 1, status_message: " wrong password" });
					this.logger.log(`[${client.id}] Cannot join room: ${payoad.room_name}: wrong password`);
					return ; 
				}
			}
			else if (local_room.protection === RoomProtection.PRIVATE)
			{
				if(local_room.invited.find(string => string === User.name))
					local_room.users.push(client);
				else
				{
					client.emit("JOINED_ROOM", { status: 1, status_message: " you are is not in room's invite list" });
					this.logger.log(`[${client.id}] Cannot join room: ${payoad.room_name}: Client is not in room's invite list`);
					return ;
				}
			}
			else
			{
				client.emit("JOINED_ROOM", { status: 1, status_message: "unknown room protection type" });
				this.logger.log(`[${client.id}] Cannot join room: ${payoad.room_name}: unknown room protection type`);
				return ;
			}
		}

		this.logger.log(`[${client.id}] joined room ${payoad.room_name}`);
		client.join(payoad.room_name)
		if (!client.emit("JOINED_ROOM", {
			status: 0,
			room_name: local_room.name,
			// owner 
			// online users
			// ...
		}))
		{
			client.emit("JOINED_ROOM", { status: 1, status_message: "unable to join room" });
			this.logger.log(`[${client.id}] Cannot join room: ${payoad.room_name}: unable to join room`);
			return;
		}
	}




	// TODO SECURITY what happens if owner leaves ? 
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
		const dto : RoomLeftDto = { status: 1, room_name: payload };
		client.emit('LEFT_ROOM', dto);
		client.leave(payload);
		if (local_room.users.length === 0)
			this.rooms.splice(this.rooms.indexOf(local_room), 1);
	}




	// TODO documentation
	@SubscribeMessage("INVITE_USER")
	inviteUser(client: Socket, room_invite : room_invite 
	): void
	{
		let local_room = this.rooms.find(o => o.name === room_invite.room_name);
		if (local_room === undefined)
		{
			this.logger.log(`[${client.id}] Cannot invite to room: ${room_invite.room_name}: no such room`);
			return ;
		}
		else 
		{
			if (local_room.users.find(c => c === client))
			{
				this.logger.log(`[${client.id}] Cannot invite to room: ${room_invite.room_name}: user is already invited to that room`);
				return ;
			}
			else if (local_room.invited.find(c => c === client.id))
			{
				this.logger.log(`[${client.id}] Cannot invite to room: ${room_invite.room_name}: user is already invited to that room`);
				return ;
			}
			local_room.invited.push(client.id);
		}
	}



	// TODO SECURITY protect against proctection disabling from outside
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
	protectRoom(client: Socket, payload: room_protect)
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
				case RoomProtection.NONE:
					local_room.protection = RoomProtection.NONE;
					break;
				case RoomProtection.PRIVATE:
					local_room.protection = RoomProtection.PRIVATE;
					break;
				case RoomProtection.PROTECTED:
					local_room.protection = RoomProtection.PROTECTED;
					if (payload["opt"] === undefined)
						throw new BadRequestException("No opt parameter: Cannot set a room protection mode to private without sending a password")
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
	renameRoom(client: Socket, payload: room_rename)
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



	/**
	 * Emit on this event to change the password of a room and set password
	 * @field name_room: the name of room
	 * @field new_pass: the new password for the room
	 */
	@SubscribeMessage('ROOM_CHANGE_PASS')
	room_change_pass(client:Socket, payload: room_change_pass)
	{
		let local_room = this.rooms.find(o => o.name === payload.room_name);
		if (local_room === undefined)
		{
			console.error(`Cannot change password unknown room: ${payload.room_name}`);
			throw new BadRequestException(`Unknown room ${payload.room_name}`);
		}
		if (client !== local_room.owner)
		{
			throw new UnauthorizedException("Only the room owner can change password the room !");
		}
		let is_new_pass = this.rooms.find(o => o.password === payload.new_pass);
		if (is_new_pass === undefined)
		{
			console.error(`Cannot change password `);
			throw new BadRequestException(`Bad password (try again with another password)`);
		}
		local_room.password = payload.new_pass;
	}


	// TODO empecher de recuperer la liste d'users si on est pas dans la room
	@SubscribeMessage('USER_LIST')
	user_list(client: Socket , payload: string) : void
	{
		var	current_room = this.rooms.find(e => e.name === payload)
		var	names_list : Array<string> = [];
		
		if (current_room !== undefined)
		{
			current_room.users.forEach(element => {
				names_list.push(element.id);
			});
			client.emit("USER_LIST", names_list);
		}
	}

	//todo
	@SubscribeMessage('ROOM_BAN')
	room_block(client:Socket, payload: RoomBanDto): void
	{
		this.logger.log(`Client emit ban: ${client.id}`);
	}

	//todo
	@SubscribeMessage('ROOM_MUTE')
	room_mute(client:Socket, payload: RoomMuteDto): void
	{
		this.logger.log(`Client emit mute: ${client.id}`);
	}

	//todo
	@SubscribeMessage('ROOM_PROMOTE')
	room_promote(client:Socket, payload: RoomPromoteDto): void
	{
		this.logger.log(`Client emit promote: ${client.id}`);
	}


	// TODO SEND ONLY PUBLIC CHANS  
	// TODO do some RoomListDTO  
	@SubscribeMessage('ROOM_LIST')
	room_list(client: Socket): void
	{
		var	rooms_list : Array<{name: string, has_password: boolean}> = [];
		this.rooms.forEach(room => {
			rooms_list.push({
				name: room.name,
				has_password: room.password !== null,
			})
		});
		client.emit('ROOM_LIST', rooms_list);
	}

	

	handleConnection(client: Socket, ...args: any[]) : void
	{
		let userInfo = this.chatService.getUserFromSocket(client);

		if (userInfo === undefined)
		{
			this.logger.log(`Chat warning: Unable to retrieve users informations on socket ${client.id}`);
			return ;
		}
		this.logger.log(`${userInfo.username} connected to the chat under id : ${client.id}`);
	}



	handleDisconnect(client: Socket)
	{
		this.logger.log(`Client disconnected: ${client.id}`);
		this.rooms.forEach(room => {this.leaveRoom(client,room.name)});
	}
}

