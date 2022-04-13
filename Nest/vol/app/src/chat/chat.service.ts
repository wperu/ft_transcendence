import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TokenService } from 'src/auth/token.service';

import { ChatUser } from 'src/chat/interface/chat_user'

@Injectable()
export class ChatService {
    constructor (
        private tokenService: TokenService
    )
    {}

    getUserFromSocket(socket: Socket): ChatUser | undefined
    {
        const data: Object = this.tokenService.decodeToken(socket.handshake.auth.token);
        /* todo   maybe check if data contains the keys that we have in ChatUser */
        /* todo   and only that so we cant pass data through here                */

        return (data as ChatUser);
    }
}