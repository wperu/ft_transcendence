import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
	console.log("findAll");
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne(id);

	if (user)
	{
		return user
	}
  }

  async addOne(user: User) : Promise<void>
  {
	console.log(user);

	/*user.id = 0;
	user.firstName = "ff";
	user.lastName = "gg";
	user.isActive = true;*/

	const newUser =  await this.usersRepository.create(user);
	await this.usersRepository.save(user);
	return ;
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
