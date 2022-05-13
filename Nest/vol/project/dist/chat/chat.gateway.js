"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const date_fns_1 = require("date-fns");
const socket_io_1 = require("socket.io");
const user_entity_1 = require("../entities/user.entity");
const room_1 = require("../../../../../Common/Dto/chat/room");
const room_invite_1 = require("../../../../../Common/Dto/chat/room_invite");
const room_join_1 = require("../../../../../Common/Dto/chat/room_join");
const room_rename_1 = require("../../../../../Common/Dto/chat/room_rename");
var RoomProtection;
(function (RoomProtection) {
    RoomProtection[RoomProtection["NONE"] = 0] = "NONE";
    RoomProtection[RoomProtection["PROTECTED"] = 1] = "PROTECTED";
    RoomProtection[RoomProtection["PRIVATE"] = 2] = "PRIVATE";
})(RoomProtection || (RoomProtection = {}));
let ChatGateway = class ChatGateway {
    constructor(rooms) {
        this.rooms = rooms;
        this.logger = new common_1.Logger('AppGateway');
    }
    afterInit(server) {
        this.logger.log("Server listening on ");
    }
    handleMessage(client, payload) {
        let msg_obj = {
            message: payload.message,
            sender: "getUserBySocket",
            send_date: (0, date_fns_1.format)(Date.now(), "yyyy-MM-dd HH:mm:ss"),
            room_name: payload.room_name
        };
        this.logger.log("[Socket io] new message: " + msg_obj.message);
        this.server.to(payload.room_name).emit("RECEIVE_MSG", msg_obj);
    }
    createRoom(client, payload) {
        let local_room = this.rooms.find(o => o.name === payload.room_name);
        if (local_room === undefined) {
            this.rooms.push({
                name: payload.room_name,
                protection: payload.proctection,
                users: [client],
                invited: [],
                muted: [],
                owner: client,
            });
        }
        else {
            throw new common_1.BadRequestException(`room exist impossible create with same name`);
        }
    }
    joinRoom(client, payoad) {
        let local_room = this.rooms.find(o => o.name === payoad.room_name);
        if (local_room === undefined)
            throw new common_1.BadRequestException(`no exist room with this name: ${payoad.room_name}`);
        else {
            let is_user = local_room.users.find(c => c === client);
            if (is_user !== undefined)
                throw new common_1.BadRequestException(`Client ${client.id} has already joined ${payoad.room_name}`);
            if (local_room.protection === RoomProtection.NONE) {
                local_room.users.push(client);
            }
            else if (local_room.protection === RoomProtection.PROTECTED) {
                if (local_room.password === payoad.password)
                    local_room.users.push(client);
                else
                    throw new common_1.UnauthorizedException("Wrong password");
            }
            else if (local_room.protection === RoomProtection.PRIVATE) {
                if (local_room.invited.find(string => string === user_entity_1.User.name))
                    local_room.users.push(client);
                else
                    throw new common_1.UnauthorizedException("No invited in room");
            }
            else {
                throw new common_1.UnauthorizedException(`Cannot join room : ${payoad.room_name}`);
            }
        }
        if (client.join(payoad.room_name))
            client.emit("COMFIRM_JOIN: " + local_room.name + " socket: " + client);
        else
            throw new common_1.UnauthorizedException(`Cannot join room : ${payoad.room_name},
				Socket client: ${client}`);
    }
    leaveRoom(client, payload) {
        let local_room = this.rooms.find(o => o.name === payload);
        if (local_room === undefined) {
            console.error("Left an undefined room ??");
        }
        else {
            let user_idx = local_room.users.indexOf(client);
            local_room.users.splice(user_idx, 1);
        }
        this.logger.log(`Client ${client.id} left room ${payload}`);
        client.leave(payload);
        if (local_room.users.length === 0)
            this.rooms.splice(this.rooms.indexOf(local_room), 1);
    }
    inviteUser(client, room_invite) {
        let local_room = this.rooms.find(o => o.name === room_invite.room_name);
        if (local_room === undefined) {
            console.log("you invite in room undefined ???");
        }
        else {
            if (local_room.protection !== RoomProtection.PRIVATE) {
                throw new common_1.UnauthorizedException(`Cannot join room : ${room_invite.room_name}`);
            }
            else {
                let is_user = local_room.users.find(c => c === client);
                if (is_user !== undefined)
                    throw new common_1.BadRequestException(`Client ${client.id} has already joined ${room_invite.room_name}`);
                local_room.users.push(client);
            }
        }
        this.logger.log(`Client ${client.id} joined room ${room_invite.room_name}`);
        client.join(room_invite.room_name);
    }
    protectRoom(client, payload) {
        let local_room = this.rooms.find(o => o.name === payload.room_name);
        if (local_room === undefined) {
            console.error(`Cannot set protection to unknown room: ${payload.room_name}`);
            throw new common_1.BadRequestException(`Unknown room ${payload.room_name}`);
        }
        if (client === local_room.owner) {
            switch (payload.protection_mode) {
                case RoomProtection.NONE:
                    local_room.protection = RoomProtection.NONE;
                    break;
                case RoomProtection.PRIVATE:
                    local_room.protection = RoomProtection.PRIVATE;
                    break;
                case RoomProtection.PROTECTED:
                    local_room.protection = RoomProtection.PROTECTED;
                    if (payload["opt"] === undefined)
                        throw new common_1.BadRequestException("No opt parameter: Cannot set a room protection mode \
to private without sending a password");
                    local_room.password = payload.opt;
                    break;
                default:
                    console.log(`Unknown protection mode: ${payload.protection_mode}`);
            }
        }
    }
    renameRoom(client, payload) {
        let local_room = this.rooms.find(o => o.name === payload.old_name);
        if (local_room === undefined) {
            console.error(`Cannot rename unknown room: ${payload.old_name}`);
            throw new common_1.BadRequestException(`Unknown room ${payload.old_name}`);
        }
        if (client !== local_room.owner) {
            throw new common_1.UnauthorizedException("Only the room owner can rename the room !");
        }
        let is_new_name = this.rooms.find(o => o.name === payload.new_name);
        if (is_new_name !== undefined) {
            console.error(`Cannot rename room ${payload.old_name} to  ${payload.new_name}: A room with that name already exists`);
            throw new common_1.BadRequestException(`Bad name: ${payload.new_name} (try again with another name)`);
        }
        local_room.name = payload.new_name;
    }
    room_change_pass(client, payload) {
        let local_room = this.rooms.find(o => o.name === payload.room_name);
        if (local_room === undefined) {
            console.error(`Cannot change password unknown room: ${payload.room_name}`);
            throw new common_1.BadRequestException(`Unknown room ${payload.room_name}`);
        }
        if (client !== local_room.owner) {
            throw new common_1.UnauthorizedException("Only the room owner can change password the room !");
        }
        let is_new_pass = this.rooms.find(o => o.password === payload.new_pass);
        if (is_new_pass === undefined) {
            console.error(`Cannot change password `);
            throw new common_1.BadRequestException(`Bad password (try again with another password)`);
        }
        local_room.password = payload.new_pass;
    }
    user_list(client, payload) {
        let listuse;
        payload.users.forEach(users => { listuse.push(payload.users); });
        client.emit('USER_LIST', listuse);
    }
    room_list(client) {
        let lists;
        this.rooms.forEach(room => { lists.push(room.name); });
        client.emit('ROOM_LIST', lists);
    }
    handleConnection(client, ...args) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('SEND_MESSAGE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('CREATE_ROOM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, typeof (_a = typeof room_1.create_room !== "undefined" && room_1.create_room) === "function" ? _a : Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "createRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('JOIN_ROOM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, typeof (_b = typeof room_join_1.default !== "undefined" && room_join_1.default) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "joinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('LEAVE_ROOM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "leaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("INVITE_USER"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, typeof (_c = typeof room_invite_1.default !== "undefined" && room_invite_1.default) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "inviteUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('PROTECT_ROOM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, typeof (_d = typeof room_1.room_protect !== "undefined" && room_1.room_protect) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "protectRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('RENAME_ROOM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, typeof (_e = typeof room_rename_1.room_rename !== "undefined" && room_rename_1.room_rename) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "renameRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ROOM_CHANGE_PASS'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, typeof (_f = typeof room_rename_1.room_change_pass !== "undefined" && room_rename_1.room_change_pass) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "room_change_pass", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('USER_LIST'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, typeof (_g = typeof room_1.room !== "undefined" && room_1.room) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "user_list", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ROOM_LIST'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "room_list", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(+process.env.WS_CHAT_PORT, {
        path: "/socket.io/",
        cors: {
            origin: '*',
        },
        transports: ['websocket']
    }),
    __metadata("design:paramtypes", [Array])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map