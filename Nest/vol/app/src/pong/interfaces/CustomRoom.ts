import { PongUser } from "./PongUser";

export interface CustomRoom
{
	id:		string;
	users:	Array<PongUser>;
	opts:	any; //TODO think about
}