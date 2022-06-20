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
import { IProfileDTO } from 'src/Common/Dto/User/ProfileDTO';

@Injectable()
export class UsersService
{

	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,

		private readonly tokenService: TokenService,
		private readonly twoFactorService: TwoFactorService,

	)
	{

	}


	/**
	 *  Username options
	 */
	private readonly nameRegex : string | RegExp = /^[a-zA-Z0-9]+$/;
	private readonly nameMaxLen : number = 16;
	private readonly nameMinLen : number = 4;





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

		if (user === null)
			return undefined;

		return (user);
	}


	getIUserFromUser(user : User) : IUser
	{
		let ret : IUser;

		ret = {
			id: user.id,
			reference_id: user.reference_id,
			username: user.username,
			accessCode: user.access_token,
			creation_date: user.creation_date,
			useTwoFa: user.setTwoFA,
		}

		return ret;
	}

	getProfileFromUser(user : User) : IProfileDTO
	{
		let ret : IProfileDTO;

		ret = {
			reference_id: user.reference_id,
			username: user.username,
			creation_date: user.creation_date,
			wins: user.wins,
			losses: user.losses,
			draws: user.draws,
			xp: user.xp,
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

		if (user)
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

		if (user)
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

		if (user !== undefined && user !== null)
			return user
		return (undefined)
	}




	async findUserByAccessToken(access_token: string): Promise<User | undefined>
	{
		const user = await this.usersRepository.findOne({
			where: {
				access_token: access_token
			},
		});

		if (user !== undefined && user !== null)
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
		user.avatar_file = "avatars/defaults/user-icon-" + avatar_choice + ".png";
		user.SecretCode = this.twoFactorService.generateSecret();

		/* sign the token with jwt */
		const user_data : UserToken = {
			reference_id: reference_id,
		};

		let hash = this.tokenService.generateToken(user_data);
		user.access_token = hash;

		await this.usersRepository.create(user);
		let newUser = await this.usersRepository.save(user);
		return newUser;
	}

	async remove(id: string): Promise<void>
	{
		await this.usersRepository.delete(id);
	}

	async saveUser(user: User): Promise<User>
	{
		return (await this.usersRepository.save(user));
	}

	async updateAvatar(reference_id : number, new_avatar_file: string) : Promise<string | undefined>
	{
		let	user : User;
		let	old_avatar_path: string | undefined;
		try {

			user = await this.usersRepository.findOne({
				where: [
					{reference_id: reference_id}
				],
			});
			if (user === null)
				console.warn("User with ref ID: " + reference_id + " doesn't exist");
			else
			{
				old_avatar_path = user.avatar_file;
				await this.usersRepository
						.createQueryBuilder()
						.update(User)
						.set({avatar_file: new_avatar_file})
						.where("reference_id = :reference_id", {reference_id})
						.execute();
				// console.log("Avatar of " + user.username + " updated");
			}
		}
		catch(e)
		{
			console.error(e);
			return (undefined);
		}
		return (old_avatar_path);
	}

	async getAvatarPathByRefId(id: number) : Promise<string>
	{
		let user = await this.findUserByReferenceID(id);
		if (user !== undefined)
			return (user.avatar_file);
		return (null);
	}

	async updateUserName(reference_id: number, newUserName : string) : Promise<boolean>
	{
		try {
			await this.usersRepository
					.createQueryBuilder()
					.update(User)
					.set({username: newUserName})
					.where("reference_id = :reference_id", {reference_id})
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

		// console.log(user + ' ' + set);
		if (user === undefined)
			return ;

		if (user.setTwoFA === set)
			return ; // nothing to do ...
		if (set === true)
		{
			if (user.SecretCode === null)
			{
				// console.log("Generating SecretCode...");
				user.SecretCode = this.twoFactorService.generateSecret();
			}
			// console.log("turn ON 2FA");
			user.setTwoFA = set;
		}
		else
		{
			// console.log("turn OFF 2FA");
			user.setTwoFA = set;
		}
		await this.saveUser(user);
	}

	checkToken(token: string, secret: string): boolean
	{
		let ret = this.twoFactorService.isValide(token, secret);

		// console.log(ret);
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
	}

	/**
	 * check if username is valide
	 * @param username
	 * @returns
	 */
	isValideUsername(name: string) : boolean
	{
		if(name.match(this.nameRegex) === null)
			return false;
		if (!(name.length <= this.nameMaxLen && name.length >= this.nameMinLen))
			return false;
		return true;
	}

	async	addWin(user: User)
	{
		user.xp += 8;
		user.wins++;
		await this.saveUser(user);
	}

	async	addLoss(user: User)
	{
		user.xp += 2;
		user.losses++;
		await this.saveUser(user);
	}

	async	addDraw(user: User)
	{
		user.xp += 5;
		user.draws++;
		await this.saveUser(user);
	}
}
