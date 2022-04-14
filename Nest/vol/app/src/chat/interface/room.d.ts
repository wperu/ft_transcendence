import { Socket } from "socket.io";
import { ChatUser } from "./chat_user";

interface room
{
    name: string,
	protection: RoomProtection,
	owner: Socket,
	users: Array<ChatUser>
	invited : Array<string>,
	muted : Array<string>,
	banned : Array<string>,
	password?: string,
}

export {room};