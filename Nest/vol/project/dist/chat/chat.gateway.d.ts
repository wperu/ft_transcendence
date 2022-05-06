import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { room, create_room, room_protect } from '../../../../../Common/Dto/chat/room';
import room_invite from '../../../../../Common/Dto/chat/room_invite';
import room_join from '../../../../../Common/Dto/chat/room_join';
import { room_rename, room_change_pass } from '../../../../../Common/Dto/chat/room_rename';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private rooms;
    server: Server;
    private logger;
    constructor(rooms: room[]);
    afterInit(server: Server): void;
    handleMessage(client: Socket, payload: {
        message: string;
        room_name: string;
    }): void;
    createRoom(client: Socket, payload: create_room): void;
    joinRoom(client: Socket, payoad: room_join): void;
    leaveRoom(client: Socket, payload: string): void;
    inviteUser(client: Socket, room_invite: room_invite): void;
    protectRoom(client: Socket, payload: room_protect): void;
    renameRoom(client: Socket, payload: room_rename): void;
    room_change_pass(client: Socket, payload: room_change_pass): void;
    user_list(client: Socket, payload: room): void;
    room_list(client: Socket): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
}
