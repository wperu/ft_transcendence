import { forwardRef, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { format } from 'date-fns';
import { Server, Socket } from 'socket.io';
import { ChatUser } from 'src/chat/interface/ChatUser';
import { CreateRoomDTO ,RoomProtect, SendMessageDTO, RoomMuteDto, RoomPromoteDto, RoomBanDto, UserDataDto, RcvMessageDto, JoinRoomDto} from '../Common/Dto/chat/room';
import { RoomRename, RoomChangePassDTO } from '../Common/Dto/chat/RoomRename';
import { ChatService } from './chat.service';
import { ENotification, NotifDTO } from 'src/Common/Dto/chat/notification';
import { GameInviteDTO } from 'src/Common/Dto/chat/gameInvite';
import { ELevel, NoticeDTO } from 'src/Common/Dto/chat/notice';
import { RoomService } from 'src/room/room.service';

// Todo fix origin
@WebSocketGateway(+process.env.WS_CHAT_PORT, {
	path: "/socket.io/",
	namespace: "/chat",
	cors: {
		origin: '*',
	},
	transports: ['websocket']
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, OnModuleInit
{
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('ChatGateway');


	constructor(
		@Inject(forwardRef(() => ChatService))
		private chatService: ChatService,
		private readonly roomService: RoomService,
	) { }

	onModuleInit()
	{
		this.logger.log("Module initialized");
	}


	afterInit(server: Server)
	{
		this.logger.log("Server listening on ");
	}


	/**
	 * Emit to this event to send a message to a room
	 * //todo username
	 * @field message: The message to send to the room
	 * @field room: The room name to send the message to
	 */
	@SubscribeMessage('SEND_MESSAGE')
	async	handleMessage(client: Socket, payload: SendMessageDTO) : Promise<void>
	{
		let user: ChatUser | undefined = await this.chatService.getUserFromSocket(client);

		if (!await this.roomService.isMute(payload.room_id, user.reference_id))
		{
			let msg_obj : RcvMessageDto;

			msg_obj = {
				message:	payload.message,
				sender:		user.username,
				refId:		user.reference_id,
				send_date:	format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
				room_id:	payload.room_id
			};

			// TODO check if user is actually in room
			// TODO maybe store in DB if we want chat history ?

			this.logger.log("[Socket io] new message: " + msg_obj.message);
			this.server.to(payload.room_id.toString()).emit("RECEIVE_MSG", msg_obj); /* catch RECEIVE_MSG in client */
		}
		else
		{
			let dto : NoticeDTO =
			{
				level: ELevel.error,
				content: "stfu, you are not allowed to talk in this room",
			};
			client.emit('NOTIFICATION', dto);
		}
	}

	@SubscribeMessage('CREATE_ROOM')
	async createRoom(client: Socket, payload: CreateRoomDTO): Promise<void>
	{
		let user: ChatUser | undefined = await this.chatService.getUserFromSocket(client);
		if (user === undefined)
		return ;//todo trown error and disconnect

		await this.chatService.createRoom(client, user, payload);

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
	async joinRoom(client: Socket, payload: JoinRoomDto): Promise<void>
	{
		let user: ChatUser | undefined = await this.chatService.getUserFromSocket(client);
		if (user === undefined)
			return ;//todo trown error and disconnect

		const id = await this.chatService.joinRoom(client, user, payload, this.server);
		if (id !== undefined)
		{
			let msg_obj = {
				message:	"User " + user.username + " has joined the channel",
				sender:		"Server",
				refId:		user.reference_id,
				send_date:	format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
				room_id:	id
			};	

			this.server.to(id.toString()).emit("RECEIVE_MSG", msg_obj); /* catch RECEIVE_MSG in client */
		}
	}




	// TODO SECURITY what happens if owner leaves ?
	/**
	 * Emit to this event to leave a specific room
	 *
	 * @param room: the room name to leave.
	 */
	@SubscribeMessage('LEAVE_ROOM')
	async leaveRoom(client: Socket, payload: any): Promise<void>
	{
		let user: ChatUser | undefined = await this.chatService.getUserFromSocket(client);
		if (user === undefined)
			return ;//todo trown error and disconnect

		if (await this.chatService.leaveRoom(this.server, client, user, payload.id, payload.name))
		{
			let msg_obj = {
				message:	"User " + user.username + " has left the channel",
				sender:		"Server",
				refId:		user.reference_id,
				send_date:	format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
				room_id:	payload.id
			};

			// TODO check if user is actually in room
			// TODO maybe store in DB if we want chat history ?

			this.server.to(payload.id.toString()).emit("RECEIVE_MSG", msg_obj); /* catch RECEIVE_MSG in client */
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
	async protectRoom(client: Socket, payload: RoomProtect)
	{

	}


	/**
	 * Emit on this event to change the name of a room
	 *
	 * @field old_name: the old name of the room that will be changed
	 * @field new_name: the new name for the room
	 */
	@SubscribeMessage('RENAME_ROOM')
	async renameRoom(client: Socket, payload: RoomRename)
	{

	}



	/**
	 * Emit on this event to change the password of a room and set password
	 * @field name_room: the name of room
	 * @field new_pass: the new password for the room
	 */

	@SubscribeMessage('ROOM_CHANGE_PASS')
	async roomChangePass(client: Socket, payload: RoomChangePassDTO)
	{
		let user: ChatUser = await this.chatService.getUserFromSocket(client);

		if (user === undefined)
			return ;

		await this.chatService.roomChangePass(client, user, payload.id, payload.new_pass);
	}

	@SubscribeMessage('USER_LIST')
	async user_list(client: Socket , payload: number) : Promise<void>
	{
		let user :ChatUser = await this.chatService.getUserFromSocket(client);

		if (user !== undefined)
			await this.chatService.roomUserList(client, user, payload);
	}

	//todo
	@SubscribeMessage('ROOM_BAN')
	async room_block(client:Socket, payload: RoomBanDto): Promise<void>
	{
		const user: ChatUser = await this.chatService.getUserFromSocket(client);

		if (user === undefined)
			return; //todo disconect ?
		await this.chatService.roomBanUser(client, user, payload, this.server);
	}

	//todo
	@SubscribeMessage('ROOM_MUTE')
	async room_mute(client:Socket, payload: RoomMuteDto): Promise<void>
	{
		let user :ChatUser = await this.chatService.getUserFromSocket(client);

		if (user === undefined)
				return ;//fix
		await this.chatService.roomMute(client, user, payload, this.server);
		this.logger.log(`Client emit mute: ${client.id}`);
	}

	@SubscribeMessage('ROOM_PROMOTE')
	room_promote(client:Socket, payload: RoomPromoteDto): void
	{
		this.chatService.setIsAdmin(client, payload, this.server);
		this.logger.log(`Client emit promote: ${client.id}`);
	}

	@SubscribeMessage('ROOM_LIST')
	async room_list(client: Socket): Promise<void>
	{
		await this.chatService.sendRoomList(client);
	}


	async handleConnection(client: Socket, ...args: any[]) : Promise<void>
	{
		let user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);

		if (user === undefined)
		{
			user = await this.chatService.connectUserFromSocket(client);
			if(user === undefined)
			{
				console.log("Unknown user tried to join the chat");
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
			this.logger.log(`Chat warning: Unable to retrieve users informations on socket ${client.id}`);
			return ;

		}


		this.chatService.ConnectToChan(client, user);

		await this.chatService.emitRelation(user);

		this.logger.log(`${user.username} connected to the chat under id : ${client.id}`);
		this.logger.log(`${user.username} total connection : ${user.socket.length}`);
	}


	/**
	 * Upon disconnection, sockets leave all the channels they were part of automatically, and no special teardown is needed on your part.
	 * https://socket.io/docs/v3/rooms/#disconnection
	 * @param client
	 */
	async handleDisconnect(client: Socket)
	{
		this.logger.log(`Client disconnected: ${client.id}`);
		//this.rooms.forEach(room => {this.leaveRoom(client,room.name)});

		let userInfo : ChatUser | undefined = await this.chatService.disconnectClient(client);
		if (userInfo !== undefined)
		{
			if(userInfo.socket.length === 0)
			{
				this.chatService.removeUser(userInfo.reference_id);
			}
		}
	}

	/**
	 ****** FRIEND PART ******
	 */


	 /**
	  *
	  * @param client
	  * @param payload refId
	  */
	@SubscribeMessage('ADD_FRIEND')
	async add_friend(client: Socket, payload: number) : Promise<void>
	{
		let user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);

		if (user !== undefined)
		{
			if (await this.chatService.addFriend(client, user, payload) === false)
				return ;

			let us = this.chatService.getUserFromID(payload);

			if (us !== undefined)
			{
				let dto : NotifDTO[];

				dto = [{
					type: ENotification.FRIEND_REQUEST,
					req_id: user.reference_id,
					username: user.username,
					content: undefined,
					date: new Date(),
				}]

				let ret = await this.chatService.getFriendList(us) as UserDataDto[];
				let ret2 = await this.chatService.getRequestList(us) as UserDataDto[];

				let notifDto : NoticeDTO;
				us.socket.forEach(s => {
					s.emit('FRIEND_LIST', ret);
					s.emit('FRIEND_REQUEST_LIST', ret2);
					notifDto = { level: ELevel.info, content: "Someone wants to be your friend" };
					s.emit('NOTIFICATION', notifDto);
				});

				let ret3 = await this.chatService.getFriendList(user) as UserDataDto[];

				user.socket.forEach(s => {
					s.emit('FRIEND_LIST', ret3);
				});
			}
		}
	}

	/**
	 *
	 * @param client
	 * @param payload
	 * @returns
	 */
	@SubscribeMessage('ADD_FRIEND_USERNAME')
	async add_friend_by_username(client: Socket, payload: string) : Promise<void>
	{
	  let src_user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);

	  if (src_user !== undefined)
	  {

		let us = await this.chatService.getUserByUsername(payload);
		if (us !== undefined)
		{
			if(await this.chatService.addFriend(client, src_user, us.reference_id) === false)
				return ;

			let recv = this.chatService.getUserFromID(us.reference_id);

			if (recv !== undefined)
			{
				let dto : NotifDTO[];

				dto = [{
					type: ENotification.FRIEND_REQUEST,
					req_id: src_user.reference_id,
					username: src_user.username,
					content: undefined,
					date: new Date(),
				}]

				let ret = await this.chatService.getFriendList(recv) as UserDataDto[];
				let ret2 = await this.chatService.getRequestList(recv) as UserDataDto[];

				let notifDto : NoticeDTO;
				recv.socket.forEach(s => {
					s.emit('FRIEND_LIST', ret);
					s.emit('FRIEND_REQUEST_LIST', ret2);
					notifDto = { level: ELevel.info, content: "Someone wants to be your friend" };
					s.emit('NOTIFICATION', notifDto);
				});

				let ret3 = await this.chatService.getFriendList(src_user) as UserDataDto[];

				src_user.socket.forEach(s => {
					s.emit('FRIEND_LIST', ret3);
				});
			}
		}
		else
		{
			client.emit("NOTIFICATION", { level: ELevel.error, content: "Unknow User" })
			return ;
		}
	  }
	}

	@SubscribeMessage('RM_REQUEST_FRIEND')
	async rm_request_friend(client: Socket, payload: number) : Promise<void>
	{
		let user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);

		if (user !== undefined)
		{
			await this.chatService.denyRequestFriend(user, payload);
		}
	}

	@SubscribeMessage('RM_FRIEND')
	async rm_friend(client: Socket, payload: number) : Promise<void>
	{
		let user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);

		if (user !== undefined)
		{
			await this.chatService.rmFriend(user, payload);
			let ret = await this.chatService.getFriendList(user) as UserDataDto[];

			user.socket.forEach(s => {
				s.emit('FRIEND_LIST', ret);
			});
		}
	}

	@SubscribeMessage('BLOCK_USER')
	async block_user(client: Socket, payload: number) : Promise<void>
	{
		let user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);

		if (user !== undefined)
		{
			await this.chatService.blockUser(user, payload);

			let ret = await this.chatService.getBlockList(user) as UserDataDto[];

			user.socket.forEach(s => {
				s.emit('BLOCK_LIST', ret);
			});

			const ublock = this.chatService.getUserFromID(payload);

			if (ublock !== undefined)
				this.chatService.emitRelation(ublock);
			this.chatService.emitRelation(user);
		}
	}

	@SubscribeMessage('UNBLOCK_USER')
	async unblock_user(client: Socket, payload: number) : Promise<void>
	{
		let user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);

		if (user !== undefined)
		{
			await this.chatService.unBlockUser(user, payload);

			let ret = await this.chatService.getBlockList(user) as UserDataDto[];
			user.socket.forEach(s => {
				s.emit('BLOCK_LIST', ret);
			});
		}
	}

	@SubscribeMessage('FRIEND_LIST')
	async friend_list(client: Socket) : Promise<void>
	{
		let user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);

		if (user !== undefined)
		{
			let ret = await this.chatService.getFriendList(user) as UserDataDto[];

			client.emit('FRIEND_LIST', ret);
		}
	}


	//todo rework emit (use date)
	@SubscribeMessage('FRIEND_REQUEST_LIST')
	async request_list(client: Socket) : Promise<void>
	{
		let user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);

		if (user !== undefined)
		{
			let ret = await this.chatService.getRequestList(user) as UserDataDto[];

			client.emit('FRIEND_REQUEST_LIST', ret);
		}
		return ;
	}

	@SubscribeMessage('BLOCK_LIST')
	async block_list(client: Socket) : Promise<void>
	{
		const user : ChatUser | undefined = await this.chatService.getUserFromSocket(client);
		if (user !== undefined)
		{
			const ret = await this.chatService.getBlockList(user) as UserDataDto[];

			client.emit('BLOCK_LIST', ret);
		}
	}

	@SubscribeMessage('GAME_INVITE')
	async game_invite(client: Socket, data: GameInviteDTO)
	{
		this.logger.log("Invite to game");
		await this.chatService.gameInvite(client, data);
	}


}
