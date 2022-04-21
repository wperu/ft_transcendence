import { Injectable } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';

import { ChatUser, UserData } from 'src/chat/interface/ChatUser'
import { User } from 'src/entities/user.entity';
import { FriendsService } from 'src/friends/friends.service';
import { ChatModule } from './chat.module';
import { Room } from './interface/room';

@Injectable()
export class ChatService {
    constructor (
        private tokenService: TokenService,
		private friendService: FriendsService,
		private rooms: Room[],
		private users: ChatUser[],

    )
    { this.rooms = [];}


	connectUserFromSocket(socket: Socket): ChatUser | undefined
	{
        const data: ChatUser = this.tokenService.decodeToken(socket.handshake.auth.token) as ChatUser;

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

		/*if (chatUser.socketId.length === 0)
			users.splice(users.findIndex((u) => { return u.username === us.username}), 1);*/

		return (chatUser);
	}



	isUserInRoom(user: ChatUser, room: Room) : boolean
	{
		return (room.users.find((u) => { u === user }) !== undefined)
	}



	createRoom(room_name: string, room_private: boolean, owner: ChatUser, password: string = "")
	{
		this.rooms.push({
			name: room_name,
			private_room: room_private,
			users: [owner],
			invited : [],
			muted: [],
			banned : [],
			owner: owner,
			password : password,
		})
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
		return ((room.owner.socket.find((s) => { user.socket.find((u) => (u === s)) !== undefined}) !== undefined));
	}


	getAllRooms(): Room[]
	{
		const ref = this.rooms;
		return (ref);
	}

	/*

	//Todo create userDto 
	async getFriendList(user: ChatUser) : Promise<UserData[]>
	{
		const relation = await this.friendService.findFriendOf(user.reference_id);

		let ret: UserData[];


		relation.forEach((rel) => {
			ret.push({
				username: "default", //todo
				reference_id: rel.id_two,
			});
		});

		return ret;
	}

	async getBlockList(user: ChatUser) : Promise<UserData[]>
	{
		const relation = await this.friendService.findBlockedOf(user.reference_id);

		let ret: UserData[];


		relation.forEach((rel) => {
			ret.push({
				username: "default", //todo
				reference_id: rel.id_two,
			});
		});

		return ret;
	}

	async getRequestList(user: ChatUser) : Promise<UserData[]>
	{
		const relation = await this.friendService.findRequestOf(user.reference_id);

		let ret: UserData[];


		relation.forEach((rel) => {
			ret.push({
				username: "default", //todo
				reference_id: rel.id_two,
			});
		});

		return ret;
	}
	*/

}