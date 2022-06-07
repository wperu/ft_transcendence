import { PongUser } from "./PongUser";

export interface CustomRoom
{
	id:		string;
	users:	Array<PongUser>;
	players:Array<PongUser>;
	opts:	any; //TODO think about
}