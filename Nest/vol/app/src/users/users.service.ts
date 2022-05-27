import { ConsoleLogger, Injectable, UploadedFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { In, MoreThan, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { TokenService } from 'src/auth/token.service';
import { UserToken } from '../Common/Dto/User/UserToken'
import IUser from 'src/Common/Dto/User/User';
import { TwoFactorService } from 'src/auth/auth.twoFactor.service';
import { Express } from 'express';
import { diskStorage } from 'multer';

@Injectable()
export class UsersService
{

	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,

		private readonly tokenService: TokenService,
		private readonly twoFactorService: TwoFactorService,
	) {}



	async findAll(): Promise<User[]>
	{
		return await this.usersRepository.find();
	}



	async findUserByID(id: number): Promise<User | undefined>
	{
		const user = await this.usersRepository.findOne({
			where: {
				id: In([id])
			},
		});
		return (user);
	}


	getIUserFromUser(user : User)
	{
		let ret : IUser;

		ret = {
			id: user.id,
			reference_id: user.reference_id,
			username: user.username,
			accessCode: user.access_token_42,
			creation_date: user.creation_date,
			avatar_id : 0,
			useTwoFa: user.setTwoFA,
		}

		return ret;
	}

	async findUserByReferenceID(reference_id: number): Promise<User | undefined>
	{
		const user = await this.usersRepository.findOne({
			where: {
				reference_id: In([reference_id])
			},
		});

		if (user !== undefined)
			return user
		return (undefined)
	}

	async findUserByUsername(username: string): Promise<User | undefined>
	{
		const user = await this.usersRepository.findOne({
			where: {
				username: In([username])
			},
		});

		if (user !== undefined)
			return user
		return (undefined)
	}

	async findUserByName(name: string): Promise<User | undefined>
	{
		const user = await this.usersRepository.findOne({
			where: {
				username: In([name])
			},
		});

		if (user !== undefined)
			return user
		return (undefined)
	}




	async findUserByAccessToken(access_token: string): Promise<User | undefined>
	{
		const user = await this.usersRepository.findOne({
			where: {
				access_token_42: access_token
			},
		});

		if (user !== undefined)
			return user;
		return (undefined)
	}




	async createUser(
		reference_id: number,
		username: string,
		token : {
			access_token: string,
			refresh_token: string,
			expires_in: number
		}
	) : Promise<User>
	{
		let avatar_choice = Math.floor(Math.random() * 4);
		let user: User = new User();
		user.reference_id = reference_id;
		user.username = username;
		user.refresh_token_42 = token.refresh_token;
		user.token_expiration_date_42 = new Date(Date.now() + token.expires_in * 1000);
		user.avatar_file = "avatars/defaults/user-icon-" + avatar_choice + ".png";
		user.SecretCode = this.twoFactorService.generateSecret();

		/* sign the token with jwt */
		const user_data : UserToken = {
			reference_id: reference_id,
		};

		let hash = this.tokenService.generateToken(user_data);
		user.access_token_42 = hash;

		await this.usersRepository.create(user);
		let newUser = await this.usersRepository.save(user);
		return newUser;
	}




	async checkAccessTokenExpiration(user: User) : Promise<boolean>
	{
		const u = await this.usersRepository.findOne({
			where: {
				id: user.id,
				token_expiration_date_42: MoreThan(format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"))
			},
		});

		if (u === undefined)
			return (false);
		return (true);
	}




	async remove(id: string): Promise<void>
	{
		await this.usersRepository.delete(id);
	}




	async saveUser(user: User): Promise<User>
	{
		return (await this.usersRepository.save(user));
	}

	async updateAvatar(id : number, new_avatar_file: string) : Promise<string | undefined>
	{
		let	user : User;
		let	old_avatar_path: string | undefined;
		try {

			user = await this.usersRepository.findOne({
				where: [
					{id: id}
				],
			});
			if (user === null)
				console.warn("User with ID: " + id + " doesn't exist");
			else
			{
				old_avatar_path = user.avatar_file;
				await this.usersRepository
						.createQueryBuilder()
						.update(User)
						.set({avatar_file: new_avatar_file})
						.where("id = :id", {id})
						.execute();
				console.log("Avatar of " + user.username + " updated");
			}
		}
		catch(e)
		{
			console.error(e);
			return (undefined);
		}
		return (old_avatar_path);
	}

	async getAvatarPathById(id: number) : Promise<string>
	{
		let user = await this.findUserByID(id);
		if (user !== undefined)
			return (user.avatar_file);
		return (null);
	}

	async updateUserName(id: number, newUserName : string) : Promise<boolean>
	{
		try {
			await this.usersRepository
					.createQueryBuilder()
					.update(User)
					.set({username: newUserName})
					.where("id = :id", {id})
					.execute();
		}
		catch(e)
		{
			return false;
		}
		return true;
	}

	async checkAccesWithRefId(access: string, refId : number)
	{
		const ret = await this.findUserByAccessToken(access);
		if (ret === undefined)
			return false;

		return (ret.reference_id === refId);
	}

	async setTwoFa(access: string, set: boolean)
	{
		const user = await this.findUserByAccessToken(access);

		console.log(user + ' ' + set);
		if (user === undefined)
			return ;

		if (user.setTwoFA === set)
			return ; // nothing to do ...
		if (set === true)
		{
			if (user.SecretCode === null)
			{
				console.log("Generating SecretCode...");
				user.SecretCode = this.twoFactorService.generateSecret();
			}
			console.log("turn ON 2FA");
			user.setTwoFA = set;
		}
		else
		{
			console.log("turn OFF 2FA");
			user.setTwoFA = set;
		}
		await this.saveUser(user);
	}

	checkToken(token: string, secret: string): boolean
	{
		let ret = this.twoFactorService.isValide(token, secret);

		if (typeof ret === 'boolean')
		{
			return ret;
		}
		return false;
	}

	getQR(secret: string)
	{
		const optAuth = this.twoFactorService.getOtpAuth('ft', secret);
		return optAuth;
		//return this.twoFactorService.getQrUrl(optAuth);
	}
}
