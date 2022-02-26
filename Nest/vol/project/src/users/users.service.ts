import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

	async findOne(id: number): Promise<User> {
		const user = await this.usersRepository.findOne(id);

		if (user)
		{
			return user
		}
		this.usersRepository.find
	}

	async createUser(
		reference_id: number,
		username: string,
		acces_token: string
	): Promise<User>
	{
		let user: User = new User();
		user.reference_id = reference_id;
		user.username = username;
		user.access_token_42 = acces_token;
		let newUser =  await this.usersRepository.create(user);
		await this.usersRepository.save(user);
		return newUser;
	}



	async remove(id: string): Promise<void> {
		await this.usersRepository.delete(id);
	}
}
