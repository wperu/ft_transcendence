import { Injectable } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';

import { ChatUser, UserData } from 'src/chat/interface/ChatUser'
import { ELevel, NoticeDTO } from 'src/Common/Dto/chat/notice';
import { CreateRoomDTO, JoinRoomDto, RoomBanDto, RoomLeftDto, RoomMuteDto, RoomPromoteDto, UserDataDto } from 'src/Common/Dto/chat/room';
import { ELevelInRoom, RoomJoinedDTO } from 'src/Common/Dto/chat/RoomJoined';
import { ChatRoomEntity } from 'src/entities/room.entity';
import { User } from 'src/entities/user.entity';
import { FriendsService } from 'src/friends/friends.service';
import { RoomService } from 'src/room/room.service';
import { UsersService } from 'src/users/users.service';
import { Room } from './interface/room';

@Injectable()
export class ChatService {
    constructor (
        private tokenService: TokenService,
		private friendService: FriendsService,
		private rooms: Room[],
		private users: ChatUser[],
		private userService: UsersService,
		private roomService: RoomService

    )
    { this.rooms = [];}


	connectUserFromSocket(socket: Socket): ChatUser | undefined
	{
        const data: ChatUser = this.tokenService.decodeToken(socket.handshake.auth.token) as ChatUser;

		if (data === undefined)
			return undefined;

		let idx = this.users.push({
			socket: [socket], 
			username: data.username,
			reference_id: data.reference_id,
			room_list: [],
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


	disconnectClient(socket: Socket): ChatUser | undefined
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
		this.rooms.push({
			name: data.room_name,
			private_room: data.private_room,
			users: [user],
			admins: [], // admin =/= owner
			invited : [],
			muted: [],
			banned : [],
			owner: user,
			password : data.password,
		})

		if (resp instanceof ChatRoomEntity)
		{
			let room = resp;

			let dto : RoomJoinedDTO;

			dto = {
				id: room.id,
				room_name: (data.isDm === false) ? room.name : user2.username,
				protected: (room.password_key !== null),
				level: await this.roomService.getUserLevel(room.id, room.owner, user.reference_id),
				isDm: data.isDm,
				owner: (data.isDm === false) ? room.owner : user2.reference_id,
			}
			
			for (const s of user.socket) 
			{
				s.join(dto.room_name);
				s.emit("JOINED_ROOM", dto);
			};

			if (data.isDm)
			{
				const us = this.getUserFromID(user2.reference_id);

				dto.room_name = user1.username;
				for (const s of us.socket) 
				{
					s.join(dto.room_name);
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

				s.join(room.name); //fix
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

	async leaveRoom(client: Socket, user: ChatUser, id: number, roomName: string)
	{
		//let userRoom = await this.userService.findUserByReferenceID(user.reference_id);
		if (await this.roomService.leaveRoomById(id, user.reference_id) === false)
		{
			return ;
		}

		//return;

		let dto: RoomLeftDto;
		
		dto = {
			id: 0,
			room_name: roomName,
			//room_name: roomName,
		}
		user.socket.forEach((s) => {
			s.leave(roomName);
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
			client.emit("USER_LIST", resp);
		}
	}

	async roomBanUser(client: Socket, user: ChatUser, data: RoomBanDto): Promise<void>
	{
		let resp;

		if (data.isBan)
		{
			const ban_expire = new Date(Date.now() + data.expires_in);
			resp = await this.roomService.banUser(data.id, user.reference_id, data.refId, ban_expire);
		}
		else
			resp = await this.roomService.unbanUser(data.id, user.reference_id, data.refId);
		
		let dto : NoticeDTO;
		if (resp instanceof ChatRoomEntity)
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
						s.leave(resp.name);
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

	roomExists(room_name: string) : boolean
	{
		return (this.rooms.find((r) => {return r.name === room_name}) !== undefined);
	}



	getRoom(room_name: string): Room
	{
		if (this.roomExists(room_name) === true)
		{
			const el = this.rooms.find((r) => { return r.name === room_name});
			return (el);
		}
		else
			return (undefined);
	}



	removeRoom(room_name: string): boolean
	{
		let to_remove: Room = this.getRoom(room_name);
		if (to_remove === undefined)
			return (false);
		this.rooms.splice(this.rooms.indexOf(to_remove), 1);
		return (true);
	}


	removeUser(username: string) 
	{
		this.users.splice(this.users.findIndex((u) => { return u.username === username}))
	}

	isOwner(user: ChatUser, room: Room): boolean
	{
		return (user.reference_id == room.owner.reference_id);
	}

	isAdmin(user: ChatUser, room: Room) : boolean
	{
		return (room.admins.find((u) => { u === user }) !== undefined)
	}

	getAllRooms(): Room[]
	{
		const ref = this.rooms;
		return (ref);
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
			client.join(r.name);
			user.room_list.push(r.name);
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
		}
	}

	/**
	 * 
	 * * * * RELATIONSHIP * * * * *
	 *
	 */

	//Todo create userDto 
	//todo Status of user
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
			//let status = user.is_connected; //todo

			ret.push({
				username: username,
				reference_id: rel.id_two,
				is_connected: user2.is_connected,
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
			});
		};

		return ret;
	}


	
	/**
	 * Return true if a newRequest was created
	 * @param user 
	 * @param ref_id 
	 * @returns 
	 */
	async addFriend(user: ChatUser, ref_id : number) : Promise<boolean>
	{
		if (await this.friendService.addRequestFriend(user.reference_id, ref_id) !== undefined)
			return true;

		return false;
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

}