import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
declare enum RoomProtection {
    NONE = 0,
    PROTECTED = 1,
    PRIVATE = 2
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private rooms;
    server: Server;
    private logger;
    constructor(rooms: {
        name: string;
        protection: RoomProtection;
        owner: Socket;
        users: Array<Socket>;
        password?: string;
    }[]);
    afterInit(server: Server): void;
    handleMessage(client: Socket, payload: {
        message: string;
        room_name: string;
    }): void;
    joinRoom(client: Socket, payoad: {
        room_name: string;
        password?: string;
    }): void;
    leaveRoom(client: Socket, payload: string): void;
    inviteUser(client: Socket, room_invite: {
        room_name: string;
        invited_user: string;
    }): void;
    protectRoom(client: Socket, payload: {
        room_name: string;
        protection_mode: string;
        opt?: string;
    }): void;
    renameRoom(client: Socket, payload: {
        old_name: string;
        new_name: string;
    }): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
}
export {};
