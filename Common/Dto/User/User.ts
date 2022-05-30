//Todo define what is send by backend

// peut pas importer ça dans le react

interface IUser
{
	id: number;
	reference_id: number;
	username: string;
	accessCode : string;
	creation_date: Date;
	useTwoFa: boolean;
	avatar_last_update?: number;
}

export default IUser;
