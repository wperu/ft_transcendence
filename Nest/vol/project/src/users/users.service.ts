import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@Injectable()
export class UsersService {
	
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
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

		if (user !== undefined)
			return user
		return (undefined)
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




	async findUserByAccessToken(access_token: string): Promise<User | undefined>
	{
		const user = await this.usersRepository.findOne({ 
			where: {
				access_token_42: access_token
			},
		});

		if (user !== undefined)
			return user
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
	): Promise<User>
	{
		let user: User = new User();
		user.reference_id = reference_id;
		user.username = username;
		user.access_token_42 = token.access_token;
		user.refresh_token_42 = token.refresh_token;
		user.token_expiration_date_42 = new Date(Date.now() + token.expires_in * 1000);

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
}
