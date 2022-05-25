import { Socket } from "socket.io";
import { UserBan } from "src/Common/Dto/chat/UserBlock";
import { ChatUser } from "./ChatUser";

interface Room
{
    name: string,
	private_room: boolean,
	owner: ChatUser,
	admins: Array<ChatUser>
	users: Array<ChatUser>
	invited : Array<string>,
	muted : Array<string>,
	banned : Array<UserBan>,
	password?: string,
}

export {Room as Room};