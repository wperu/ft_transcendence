import { Socket } from "socket.io";
import { ChatUser } from "./ChatUser";

interface Room
{
    name: string,
	protection: RoomProtection,
	owner: ChatUser,
	users: Array<ChatUser>
	invited : Array<string>,
	muted : Array<string>,
	banned : Array<string>,
	password?: string,
}

export {Room as Room};