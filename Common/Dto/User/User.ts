//Todo define what is send by backend

// peut pas importer ça dans le react
//import DatabaseFile from "src/entities/databaseFile.entity";


interface IUser
{
	id: number;
	reference_id: number;
	username: string;
	accessCode : string;
	token_expiration_date_42?: Date; // to erase
	creation_date: Date;
	useTwoFa: boolean;
	avatar_last_update?: number;
}

export default IUser;
