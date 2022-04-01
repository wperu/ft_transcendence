//Todo define what is send by backend
interface IUser
{
	id: number;
	reference_id: number;
	username: string;
	access_token_42?: string;
	refresh_token_42?: string;
	token_expiration_date_42?: Date;
	access_token_google?: string;
	is_connected: boolean;
	creation_date: Date;
}

export default IUser;