import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { format, getISOWeeksInYear } from 'date-fns';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { ChatUser, UserData } from 'src/chat/interface/ChatUser';
import { User } from 'src/entities/user.entity';
import { useContainer } from 'typeorm';
import { isInt8Array } from 'util/types';
import { CreateRoom,RoomProtect, RoomLeftDto, RoomMuteDto, RoomPromoteDto, RoomBanDto} from '../Common/Dto/chat/room';
import { UserBan } from 'src/Common/Dto/chat/UserBlock';
import RoomInvite from '../Common/Dto/chat/RoomInvite';
import RoomJoin from '../Common/Dto/chat/RoomJoin';
import { RoomRename, RoomChangePass } from '../Common/Dto/chat/RoomRename';
import { ChatService } from './chat.service';
import { Room } from "./interface/room";


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
		let user: ChatUser | undefined = this.chatService.getUserFromSocket(client);

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
	createRoom(client: Socket, payload: CreateRoom): void 
	{
		let user: ChatUser | undefined = this.chatService.getUserFromSocket(client);
		if (user === undefined)
			return ;//todo trown error and disconnect
		
		if (!this.chatService.roomExists(payload.room_name))
		{
			this.chatService.createRoom(payload.room_name, payload.private_room, user, payload.password);

			//todo join & add client to room
			client.join(payload.room_name);
			user.room_list.push(payload.room_name);
			user.socket.forEach((s) => {
				s.join(payload.room_name);
				s.emit("JOINED_ROOM", { status: 0, room_name: payload.room_name });
			});
			
		}
		else
		{
			client.emit("JOINED_ROOM", { status: 1, status_message: `room ${payload.room_name} already exists` });
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
	joinRoom(client: Socket, payload: RoomJoin): void
	{
		let user: ChatUser | undefined = this.chatService.getUserFromSocket(client);
		if (user === undefined)
			return ;//todo trown error and disconnect

		let local_room = this.chatService.getRoom(payload.room_name);//this.rooms.find(o => o.name === payload.room_name);
		if (local_room === undefined)
		{
			client.emit("JOINED_ROOM", { status: 1, status_message: " no such room" });
			this.logger.log(`[${client.id}] Cannot join room: ${payload.room_name}: no such room`);
			return ;
		}
		else
		{
			/* Already joined check */
			let is_user = local_room.users.find(c => c.username === user.username);
			if (is_user !== undefined)
			{
				client.emit("JOINED_ROOM", { status: 1, status_message: " you are already in that room" });
				this.logger.log(`[${client.id}] Cannot join room: ${payload.room_name}: Client ${client.id} has already joined room`);
				return ;
			}
			/* Protection check */
			if (local_room.password === "")
			{
				local_room.users.push(user);
			}
			else if (local_room.password !== "")
			{
				if (local_room.password === payload.password)
					local_room.users.push(user);
				else
				{
					client.emit("JOINED_ROOM", { status: 1, status_message: " wrong password" });
					this.logger.log(`[${client.id}] Cannot join room: ${payload.room_name}: wrong password`);
					return ; 
				}
			}
			else
			{
				client.emit("JOINED_ROOM", { status: 1, status_message: "unknown room protection type" });
				this.logger.log(`[${client.id}] Cannot join room: ${payload.room_name}: unknown room protection type`);
				return ;
			}
		}

		let ban: UserBan | undefined = local_room.banned.find(u => {u.reference_id === user.reference_id})
		if(ban !== undefined && new Date(Date.now()) < ban.expires_in)
		{
			client.emit("JOINED_ROOM", { status: 1, status_message: "You are banned from that channel"})
			return ;
		}
		this.logger.log(`[${client.id}] joined room ${payload.room_name}`);
		user.socket.forEach((s) => {
			s.join(payload.room_name);
			s.emit("JOINED_ROOM", {
				status: 0,
				room_name: local_room.name,
				// owner 
				// online users
				// ...
			})});
		user.room_list.push(payload.room_name);
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
		let user: ChatUser | undefined = this.chatService.getUserFromSocket(client);
		if (user === undefined)
			return ;//todo trown error and disconnect

		console.log('your chan: ' + this.chatService.roomExists(payload));
		let local_room = this.chatService.getRoom(payload);
		if (local_room === undefined)
		{
			console.error("Left an undefined room ??");
		}
		else
		{
			let user_idx = local_room.users.findIndex((u) => {return u.username === user.username});
			local_room.users.splice(user_idx, 1);
			this.logger.log(`Client ${client.id} left room ${payload}`);
			const dto : RoomLeftDto = { status: 1, room_name: payload };
			

			//client.leave(payload);
			user.socket.forEach((s) => {
				s.leave(payload);
				s.emit('LEFT_ROOM', dto);
			});
			user.room_list.splice(user.room_list.findIndex((room) => { return(room === payload) }), 1);
			if (local_room.users.length === 0)
				this.chatService.removeRoom(local_room.name);
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
	protectRoom(client: Socket, payload: RoomProtect)
	{
		let local_room = this.chatService.getRoom(payload.room_name)
		if (local_room === undefined)
		{
			console.error(`Cannot set protection to unknown room: ${payload.room_name}`);
			throw new BadRequestException(`Unknown room ${payload.room_name}`);
		}

		if (!this.chatService.isOwner(this.chatService.getUserFromSocket(client), local_room))
		{
			if(payload.private_room)
			{
				local_room.private_room = true;
				local_room.password = payload.opt;
			}
			else
			{
				local_room.private_room = false;
				local_room.password = payload.opt;
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
	renameRoom(client: Socket, payload: RoomRename)
	{
		let local_room = this.chatService.getRoom(payload.old_name);
		if (local_room === undefined)
		{
			console.error(`Cannot rename unknown room: ${payload.old_name}`);
			throw new BadRequestException(`Unknown room ${payload.old_name}`);
		}
		if (!this.chatService.isOwner(this.chatService.getUserFromSocket(client), local_room))
		{
			throw new UnauthorizedException("Only the room owner can rename the room !");
		}

		if (!this.chatService.roomExists(payload.new_name))
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
	@SubscribeMessage('RoomChangePass')
	RoomChangePass(client:Socket, payload: RoomChangePass)
	{
		let local_room =this.chatService.getRoom(payload.room_name);
		if (local_room === undefined)
		{
			console.error(`Cannot change password unknown room: ${payload.room_name}`);
			throw new BadRequestException(`Unknown room ${payload.room_name}`);
		}
		if  (!this.chatService.isOwner(this.chatService.getUserFromSocket(client), local_room))
		{
			throw new UnauthorizedException("Only the room owner can change password the room !");
		}
		if (local_room.password === payload.new_pass)
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
		var	current_room = this.chatService.getRoom(payload);
		var	names_list : Array<string> = [];
		
		if (current_room !== undefined)
		{
			current_room.users.forEach(element => {
				names_list.push(element.username);
			});
			client.emit("USER_LIST", names_list);
		}
	}

	//todo
	@SubscribeMessage('ROOM_BAN')
	room_block(client:Socket, payload: RoomBanDto): void
	{
		var user_ban : UserBan;
		let user :ChatUser = this.chatService.getUserFromUsername(payload.user_name);
		let current_room = this.chatService.getRoom(payload.room_name);
		if(current_room !== undefined)
		{
			user_ban.reference_id = user.reference_id;
			user_ban.expires_in = new Date(Date.now()+ payload.expires_in * 1000)
			current_room.banned.push(user_ban);
		}
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


	// TODO do some RoomListDTO  
	@SubscribeMessage('ROOM_LIST')
	room_list(client: Socket): void
	{
		var	rooms_list : Array<{name: string, has_password: boolean}> = [];
		this.chatService.getAllRooms().forEach(room => {
			if (!room.private_room) //fix me
			{
				rooms_list.push({
					name: room.name,
					has_password: room.password !== "",
				});
			}
		});
		client.emit('ROOM_LIST', rooms_list);
	}

	
	//Todo emit disconect if token is wrong
	handleConnection(client: Socket, ...args: any[]) : void
	{
		let userInfo : ChatUser | undefined = this.chatService.getUserFromSocket(client);
		
		if (userInfo === undefined)
		{
			userInfo = this.chatService.connectUserFromSocket(client);
			if(userInfo === undefined)
			{
				console.log("Unknown user tried to join the chat");
				client.disconnect();
				return ;
			}
		}
		else
		{
			let idx = userInfo.socket.find((s) => { return s.id === client.id})

			if (idx === undefined)
				userInfo.socket.push(client);
		}

		if (userInfo === undefined)
		{
			this.logger.log(`Chat warning: Unable to retrieve users informations on socket ${client.id}`);
			return ;
			
		}
		userInfo.room_list.forEach((room) => {
			client.join(room);
			client.emit("JOINED_ROOM", {
				status: 0,
				room_name: room,
				// owner 
				// online users
				// ...
			});

		})

		this.logger.log(`${userInfo.username} connected to the chat under id : ${client.id}`);
		this.logger.log(`${userInfo.username} total connection : ${userInfo.socket.length}`);

	}



	handleDisconnect(client: Socket)
	{
		this.logger.log(`Client disconnected: ${client.id}`);
		//this.rooms.forEach(room => {this.leaveRoom(client,room.name)});
		
		let userInfo : ChatUser | undefined = this.chatService.disconnectClient(client);
		if (userInfo !== undefined)
		{
			
			if(userInfo.socket.length === 0)
			{
				userInfo.room_list.forEach(room => {this.leaveRoom(client,room)});
				this.chatService.removeUser(userInfo.username);
			}
		}
	}
}

