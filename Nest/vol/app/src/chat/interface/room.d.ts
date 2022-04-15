import { Socket } from "socket.io";
import { ChatUser } from "./ChatUser";

interface Room
{
    name: string,
	private_room: boolean,
	owner: ChatUser,
	users: Array<ChatUser>
	invited : Array<string>,
	muted : Array<string>,
	banned : Array<string>,
	password?: string,
}

export {Room as Room};