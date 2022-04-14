import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';

import { ChatUser, UserData } from 'src/chat/interface/chat_user'

@Injectable()
export class ChatService {
    constructor (
        private tokenService: TokenService
    )
    {}

    getUserFromSocket(socket: Socket, users: ChatUser[], isConnection: boolean): ChatUser | undefined
    {
        const data: Object = this.tokenService.decodeToken(socket.handshake.auth.token);
        /* todo   maybe check if data contains the keys that we have in ChatUser */
        /* todo   and only that so we cant pass data through here                */
		if (data === null)
			return (undefined);

		if (data as UserData)
		{
			const us = data as UserData;

			let ret = users.find((u) => { return u.username === us.username})
			if (ret === undefined && isConnection === true)
			{
				let idx = users.push({
					//socketId: [socket.id],
					socket: [socket], 
					username: us.username,
					reference_id: us.reference_id,
					room_list: [],
				})

				ret = users[idx - 1];
			}
			else if (isConnection === true)
			{
				let idx = ret.socket.find((s) => { return s.id === socket.id})

				if (idx === undefined)
					ret.socket.push(socket);

			}
			return (ret);
		}

        return (undefined);
    }

	disconnectClient(socket: Socket, users: ChatUser[]): ChatUser | undefined
	{
		const data: Object = this.tokenService.decodeToken(socket.handshake.auth.token);

		if (data === null)
			return (undefined);

		const us = data as UserData;

		const chatUser = users.find((u) => { return u.username === us.username})
		if (chatUser === undefined)
			return undefined;//throw error
		

		chatUser.socket.splice(chatUser.socket.findIndex((s) => { return s.id === socket.id}), 1);

		/*if (chatUser.socketId.length === 0)
			users.splice(users.findIndex((u) => { return u.username === us.username}), 1);*/

		return (chatUser);
	}

}