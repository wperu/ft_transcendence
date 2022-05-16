import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { TokenService } from 'src/auth/token.service';
import { ChatUser, UserData } from 'src/chat/interface/ChatUser'
import { GameInviteDTO } from 'src/Common/Dto/chat/gameInvite';
import { ELevel, NoticeDTO } from 'src/Common/Dto/chat/notice';
import { ENotification, NotifDTO } from 'src/Common/Dto/chat/notification';
import { CreateRoomDTO, JoinRoomDto, RoomBanDto, RoomLeftDto, RoomMuteDto, RoomPromoteDto, RoomUpdatedDTO, UserDataDto } from 'src/Common/Dto/chat/room';
import { ELevelInRoom, RoomJoinedDTO } from 'src/Common/Dto/chat/RoomJoined';
import { ChatRoomEntity } from 'src/entities/room.entity';
import { User } from 'src/entities/user.entity';
import { FriendsService } from 'src/friends/friends.service';
import { RoomService } from 'src/room/room.service';
import { UsersService } from 'src/users/users.service';
import { Room } from './interface/room';


/** //todo
 * 	get friend response and send notice
 *  rework message system ?
 */

@Injectable()
export class ChatService {
    constructor (
        private tokenService: TokenService,
		private friendService: FriendsService,
		private users: ChatUser[],
		private userService: UsersService,
		private roomService: RoomService
    )
    {}


	connectUserFromSocket(socket: Socket): ChatUser | undefined
	{
        const data: ChatUser = this.tokenService.decodeToken(socket.handshake.auth.token) as ChatUser;

		if (data === undefined)
			return undefined;

		let idx = this.users.push({
			socket: [socket], 
			username: data.username,
			reference_id: data.reference_id,
		})


		return this.users[idx - 1];
	}


    getUserFromSocket(socket: Socket): ChatUser | undefined
    {
        const data: Object = this.tokenService.decodeToken(socket.handshake.auth.token);
        /* todo   maybe check if data contains the keys that we have in ChatUser */
        /* todo   and only that so we cant pass data through here                */
		if (data === null)
			return (undefined);

		if (data as UserData)
		{
			const us = data as UserData;

			let ret = this.users.find((u) => { return u.username === us.username})
			return (ret);
		}

        return (undefined);
    }

	getUsernameFromID(refId : number)
	{
		let ret = this.users.find((u) => { return u.reference_id === refId});

		if (ret === undefined)
			return "undefined";

		return ret.username;
	}

	getUserFromID(refId : number) : ChatUser
	{
		let ret = this.users.find((u) => { return u.reference_id === refId});

		if (ret === undefined)
			return ret;

		return ret;
	}



    getUserFromUsername(username: string): ChatUser | undefined
    {
        return (this.users.find((u) => { return u.username === username}));
    }


	async disconnectClient(socket: Socket): Promise<ChatUser | undefined>
	{
		const data: Object = this.tokenService.decodeToken(socket.handshake.auth.token);

		if (data === null)
			return (undefined);

		const us = data as UserData;

		const chatUser = this.users.find((u) => { return u.username === us.username})
		if (chatUser === undefined)
			return undefined;//throw error
		
		chatUser.socket.splice(chatUser.socket.findIndex((s) => { return s.id === socket.id}), 1);
		return (chatUser);
	}



	isUserInRoom(user: ChatUser, room: Room) : boolean
	{
		return (room.users.find((u) => { u === user }) !== undefined)
	}

	

	async createRoom(client: Socket, user: ChatUser, data : CreateRoomDTO) : Promise<void>
	{
		const user1 = await this.userService.findUserByReferenceID(user.reference_id);
		const user2 = await this.userService.findUserByReferenceID(data.with);

		const resp = await this.roomService.createRoom(data.room_name, user1, data.private_room, data.password, data.isDm, user2);

		if (resp instanceof ChatRoomEntity)
		{
			let room = resp;

			let dto : RoomJoinedDTO;

			dto = {
				id: room.id,
				room_name: (data.isDm === false) ? room.name : user2.username,
				protected: (room.password_key !== null),
				level: (data.isDm) ? ELevelInRoom.casual : await this.roomService.getUserLevel(room.id, room.owner, user.reference_id),
				isDm: data.isDm,
				owner: (data.isDm === false) ? room.owner : user2.reference_id,
			}
			
			for (const s of user.socket) 
			{
				s.join(room.id.toString());
				s.emit("JOINED_ROOM", dto);
			};

			if (data.isDm)
			{
				const us = this.getUserFromID(user2.reference_id);

				dto.room_name = user1.username;
				dto.owner= user1.reference_id;

				for (const s of us.socket) 
				{
					s.join(room.id.toString());
					s.emit("JOINED_ROOM", dto);
				};
			}
			else
			{
				let nDto : NoticeDTO;
				nDto = { level: ELevel.info, content: "Room " + room.name + " created" };
				client.emit("NOTIFICATION", nDto);
			}
		}
		else
		{
			let nDto : NoticeDTO;
			nDto = { level: ELevel.error, content: resp };
			client.emit("NOTIFICATION", nDto);
		}
		return;
	}

	async joinRoom(client: Socket, user: ChatUser, data: JoinRoomDto)
	{
		let userRoom = await this.userService.findUserByReferenceID(user.reference_id);
		let resp;

		if (data.id !== undefined)
			resp = await this.roomService.joinRoomById(data.id, userRoom, data.password);
		else
			resp = await this.roomService.joinRoomByName(data.roomName, userRoom, data.password);


		if (resp instanceof ChatRoomEntity)
		{
			let room = resp;

			user.socket.forEach(s => {

				let data : RoomJoinedDTO;

				data = {
					id: room.id,
					room_name: room.name,
					protected: (room.password_key !== null),
					level: ELevelInRoom.casual,
					isDm: false,
					owner: room.owner,
				}

				s.join(room.id.toString());
				s.emit("JOINED_ROOM", data);
			});
			
			let data : NoticeDTO;
			data = { level: ELevel.info, content: "Room " + room.name + " joined" };
			client.emit("NOTIFICATION", data);
		}
		else
		{
			let data : NoticeDTO;
			data = { level: ELevel.error, content: resp };
			client.emit("NOTIFICATION", data);
		}
		return;
	}

	async leaveRoom(server: Server, client: Socket, user: ChatUser, id: number, roomName: string)
	{
		//let userRoom = await this.userService.findUserByReferenceID(user.reference_id);
		const resp = await this.roomService.leaveRoomById(id, user.reference_id)
		if (typeof resp === "string")
		{
			let data : NoticeDTO;
			data = { level: ELevel.error, content: resp };
			client.emit("NOTIFICATION", data);
			return ;
		}
		else if (typeof resp === 'number')
		{
			let dto : RoomUpdatedDTO;

			dto = {id: id, owner: resp};
			server.to(id.toString()).emit('UPDATE_ROOM', dto);

			const dest = this.getUserFromID(resp);
			if (dest !== undefined)
			{
				dto = {id: id, level: ELevelInRoom.owner};
				
				for (const s of dest.socket)
				{
					s.emit('UPDATE_ROOM', dto);
				}
			
			}
		}

		let dto: RoomLeftDto;
		
		dto = {
			id: id,
			room_name: roomName,
		}
		user.socket.forEach((s) => {
			s.leave(id.toString());
			s.emit('LEFT_ROOM', dto);
		});

		let data : NoticeDTO;
		data = { level: ELevel.info, content: "Room " + roomName + " left" };
		client.emit("NOTIFICATION", data);	
	}

	/***
	 * Send list of user for roomID
	 */
	async roomUserList(client: Socket, user: ChatUser, roomId: number)
	{
		const resp = await this.roomService.userListOfRoom(roomId, user.reference_id);
		
		if (typeof resp !== 'string')
		{
			for (let u of resp)
			{
				u.is_connected = this.getUserFromID(u.reference_id) !== undefined;
			}
			client.emit("USER_LIST", resp);
		}
	}

	async roomBanUser(client: Socket, user: ChatUser, data: RoomBanDto): Promise<void>
	{
		let resp;

		if (data.isBan)
		{
			const hours = new Date(0);
			hours.setHours(data.expires_in);
			const ban_expire = new Date(Date.now() + hours.getTime());
			resp = await this.roomService.banUser(data.id, user.reference_id, data.refId, ban_expire);
		}
		else
			resp = await this.roomService.unbanUser(data.id, user.reference_id, data.refId);
		

		console.log(resp);
		let dto : NoticeDTO;
		if (typeof resp !== "string")
		{
			let left_dto : RoomLeftDto;

			left_dto = {
				id : resp.id,
				room_name: resp.name,
			}
			dto =  { level: ELevel.info, content: "User " + ((data.isBan) ? "ban" : "unban") + " !" };
			if (data.isBan)
			{
				const banUser = this.getUserFromID(data.refId);
				if (banUser !== undefined)
				{
					for (const s of banUser.socket)
					{
						s.leave(resp.id.toString());
						s.emit('LEFT_ROOM', left_dto);
						s.emit("NOTIFICATION", { level: ELevel.error, content: `Banned from ${resp.name} !` });	
					}
				}
			}
		}
		else
		{
			dto = { level: ELevel.error, content: resp };
		}
		
		client.emit("NOTIFICATION", dto);	
	}

	async roomChangePass(client: Socket, user: ChatUser, roomId: number ,pass: string)
	{
		const resp = await this.roomService.roomChangePass(roomId, user.reference_id, pass);

		let data : NoticeDTO;
		if (typeof resp !== 'string')
			data =  { level: ELevel.info, content: "Password changed !" };
		else
			data = { level: ELevel.error, content: resp };
		client.emit("NOTIFICATION", data);
	}

	async roomMute(client: Socket, user: ChatUser, data: RoomMuteDto)
	{
		let resp;

		if (data.isMute)
		{
			const mute_expire = new Date(Date.now()+ data.expires_in * 1000);
			resp = await this.roomService.roomMute(data.roomId, user.reference_id, data.refId, mute_expire);
		}
		else
		{
			resp = await this.roomService.roomUnmute(data.roomId, user.reference_id, data.refId);
		}

		let dto : NoticeDTO;
		if (typeof resp !== 'string')
			dto =  { level: ELevel.info, content: "User " + ((data.isMute) ? "mute" : "unmute") + " !" };
		else
			dto = { level: ELevel.error, content: resp };
		client.emit("NOTIFICATION", dto);
	}

	removeUser(refId: number) 
	{
		this.users.splice(this.users.findIndex((u) => { return u.reference_id === refId}))
	}

	isOwner(user: ChatUser, room: Room): boolean
	{
		return (user.reference_id == room.owner.reference_id);
	}

	isAdmin(user: ChatUser, room: Room) : boolean
	{
		return (room.admins.find((u) => { u === user }) !== undefined)
	}

	//remake that
	async ConnectToChan(client: Socket, user: ChatUser)
	{
		let rooms_list = await this.roomService.roomListOfUser(user.reference_id);
		
		
		for (const r of rooms_list)
		{
			let data : RoomJoinedDTO; 
			data = {
				id: r.id,
				room_name: r.name,		
				protected: r.has_password,
				level: await this.roomService.getUserLevel(r.id, r.owner, user.reference_id),
				isDm: r.isDm,
				owner: r.owner,
			}
			client.join(r.id.toString());
			client.emit("JOINED_ROOM", data);
		}
		
	}

	async sendRoomList(client: Socket)
	{
		const rooms = await this.roomService.publicRoomList();
		client.emit('ROOM_LIST', rooms);
	}

	//todo send to user ?
	async setIsAdmin(client:Socket, data: RoomPromoteDto)
	{
		const user = this.getUserFromSocket(client);

		if (user === undefined)
			return ;//todo disconnect;

		const resp = await this.roomService.setIsAdmin(data.room_id, data.refId,user.reference_id, data.isPromote);

		let dto : NoticeDTO;
		if (resp !== undefined)
			dto = { level: ELevel.error, content: resp };
		else
			dto = { level: ELevel.info, content: "User " + ((data.isPromote) ? "promote" : "demote")};
		client.emit("NOTIFICATION", dto);

		const newAdmin = this.getUserFromID(data.refId);
		if (newAdmin !== undefined)
		{
			//todo send update
			for (const s of newAdmin.socket)
			{
				s.emit("UPDATE_ROOM", {id: data.room_id, level: ((data.isPromote) ? ELevelInRoom.admin : ELevelInRoom.casual)});
			}
		}
	}

	/**
	 * 
	 * * * * RELATIONSHIP * * * * *
	 *
	 */

	isConnected(refId: number) : boolean
	{
		const ret = this.getUserFromID(refId);
		if (ret === undefined)
		 return false;
		return true;
	}

	//todo Status of user is In game ?
	async getFriendList(user: ChatUser) : Promise<UserDataDto[]>
	{
		const relation = await this.friendService.findFriendOf(user.reference_id);

		if (relation === undefined)
			return [];
		let ret: UserDataDto[];
		
		ret = [];
		for (const rel of relation)
		{
			let user2 = await this.userService.findUserByReferenceID(rel.id_two);

			let username = user2?.username || "default";
			let status = this.isConnected(rel.id_two);

			ret.push({
				username: username,
				reference_id: rel.id_two,
				is_connected: status,
			});
		};
		return ret;
	}

	async getBlockList(user: ChatUser) : Promise<UserData[]>
	{
		const relation = await this.friendService.findBlockedOf(user.reference_id);

		if (relation === undefined)
			return [];

		let ret: Array<UserData>;

		ret = [];
		for (const rel of relation)
		{
			let user2 = await this.userService.findUserByReferenceID(rel.id_two);
			let username = user2?.username || "default";
			
			ret.push({
				username: username,
				reference_id: rel.id_two,
			});
		};

		return ret;
	}

	async getRequestList(user: ChatUser) : Promise<UserData[]>
	{
		const relation = await this.friendService.findRequestOf(user.reference_id);

		let ret: UserData[];

		ret = [];
		if (relation === undefined)
			return [];

		for (const rel of relation)
		{
			let user2 = await this.userService.findUserByReferenceID(rel.id_one);

			let username = user2?.username || "default";
			ret.push({
				username: username || "default", //todo
				reference_id: rel.id_one,
				date: rel.date,
			});
		};

		return ret;
	}

	async denyRequestFriend(user: ChatUser, refId: number)
	{
		this.friendService.rmRequestFriend(user.reference_id, refId);
	}



	
	
	/**
	 * Return true if a newRequest was created
	 * @param user 
	 * @param ref_id 
	 * @returns 
	 */
	async addFriend(client: Socket, user: ChatUser, ref_id : number) : Promise<boolean>
	{
		const ret = await this.friendService.addRequestFriend(user.reference_id, ref_id)
		
		if (ret === undefined)
		{
			return false;
		}
		else if (typeof ret === 'string')
		{
			const dto : NoticeDTO = { level: ELevel.error, content: ret };
			client.emit("NOTIFICATION", dto);
			return false;
		}
		else
		{
			const dto : NoticeDTO = { level: ELevel.info, content: "Request Send !" };
			client.emit("NOTIFICATION", dto);
			return true;
		}
	}

	async getUserByUsername(username : string) : Promise<User>
	{
		let toSend = await this.userService.findUserByUsername(username);
		return toSend;
	}


	async rmFriend(user: ChatUser, ref_id : number) : Promise<void>
	{
		await this.friendService.rmFriend(user.reference_id, ref_id);

		return;
	}

	async blockUser(user: ChatUser, ref_id : number) : Promise<void>
	{
		await this.friendService.blockUser(user.reference_id, ref_id);

		return;
	}

	async unBlockUser(user: ChatUser, ref_id : number) : Promise<void>
	{
		await this.friendService.unBlockUser(user.reference_id, ref_id);

		return;
	}


	async gameInvite(client: Socket, data: GameInviteDTO)
	{
		const user : ChatUser | undefined = this.getUserFromSocket(client);
		if (user !== undefined)
		{
			let dto: NotifDTO[];

			dto =[
				{
					type: ENotification.GAME_REQUEST,
					req_id: data.gameRoomId,
					content: undefined,
					username: await this.getUsernameFromID(user.reference_id),
					date: new Date(),
					refId: user.reference_id,
				}]
			
			//player
			if (data.refId !== undefined)
			{
				const dest = this.getUserFromID(data.refId);
				if (dest === undefined)
				{
					//todo user is not connected;
				}
				else
				{


					for (const s of dest.socket)
					{
						s.emit('RECEIVE_NOTIF', dto);
					}
				}
			}
			else if (data.chatRoomId !== undefined) //room case 
			{
				const resp = await this.roomService.userListOfRoom(data.chatRoomId, user.reference_id);

				if (typeof resp === "string")
				{

				}
				else
				{
					for (const r of resp)
					{
						const dest = this.getUserFromID(r.reference_id);
						if (dest !== undefined && dest.reference_id !== user.reference_id)
						{
							for (const s of dest.socket)
							{
								s.emit('RECEIVE_NOTIF', dto);
							}
						}
					}
				}

			}
		}
	}

}