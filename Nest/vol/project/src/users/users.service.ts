import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

		if (user)
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

		if (user)
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
