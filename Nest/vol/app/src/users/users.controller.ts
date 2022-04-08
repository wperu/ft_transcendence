import { Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { Request } from 'express';

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
	//@UseGuards(AuthGuard)
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


	@Post("/:id/update/username")
	//@UseGuards(AuthGuard)
	async updateUserName(@Req() request: Request, @Body() body: string, @Param('id') param): Promise<void> | undefined
	{
		// TODO update user in service
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
			throw new NotFoundException();

			console.log(body);
			/*let username = body;
			if (username !== undefined)
				this.updateUserName(username, id);*/

		return (undefined);
	}

	@Post("/:id/update/useTwoFactor")
	//@UseGuards(AuthGuard)
	async updateTwoFactor(@Param('id') param): Promise<User> | undefined
	{
		// TODO update user in service
		return (undefined);
	}

	@Post("/:id/update/avatar")
	//@UseGuards(AuthGuard)
	async updateOne(@Param('id') param): Promise<User> | undefined
	{
		// TODO update user in service
		return (undefined);
	}
}
