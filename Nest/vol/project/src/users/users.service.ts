import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Timestamp } from 'typeorm';
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

	async findUserByID(id: number): Promise<User>
	{
		const user = await this.usersRepository.findOne(id);

		if (user)
		{
			return user
		}
		this.usersRepository.find
	}

	async findUserByReferenceID(reference_id: number): Promise<User | undefined>
	{
		// TODO 
		return (undefined);
	}

	async createUser(
		reference_id: number,
		username: string,
		token : {
			access: string,
			refresh: string,
			expires_in: number
		}
	): Promise<User>
	{
		let user: User = new User();
		user.reference_id = reference_id;
		user.username = username;
		user.access_token_42 = token.access;
		user.refresh_token_42 = token.refresh;

		await this.usersRepository.create(user);
		let newUser = await this.usersRepository.save(user);

		await this.usersRepository.createQueryBuilder()
			.update(newUser)
			.set({
				token_expiration_date_42: () => `token_expiration_date_42 + INTERVAL '${token.expires_in}' SECOND`
			})
			.where(`id = ${newUser.id}`)
			.execute();
		return newUser;
	}

	async remove(id: string): Promise<void>
	{
		await this.usersRepository.delete(id);
	}
}
