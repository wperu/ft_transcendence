//Todo define what is send by backend

//import DatabaseFile from "src/entities/databaseFile.entity";


interface IUser
{
	id: number;
	reference_id: number;
	username: string;
	//login: string;
	access_token_42?: string; // to erase
	refresh_token_42?: string; // to erase
	token_expiration_date_42?: Date; // to erase
	access_token_google?: string;
	is_connected: boolean; // -> enum online | offline | ingame...
	creation_date: Date;
	avatar?: any;
	avatar_id: number;
	
}

export default IUser;