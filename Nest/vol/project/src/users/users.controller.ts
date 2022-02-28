import { Controller, Get, Inject, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from '../entity/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController
{
	constructor(
		private readonly userService: UsersService
	) {}
	
	@Get()
	@UseGuards(AuthGuard)
	async findAll(): Promise<User[]>
	{
		return await this.userService.findAll();
	}

	@Get("/:id")
	async findOne(@Param('id') param): Promise<User>
	{
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
			throw new NotFoundException();

		let user = await this.userService.findUserByID(id);
		if (user === undefined)
			throw new NotFoundException();
		return (user);
	}
}
