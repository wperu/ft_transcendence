import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { json } from 'stream/consumers';
import { get } from 'superagent';
import { isArrayBuffer } from 'util/types';
import { User } from '../entity/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController
{
	constructor(
		private readonly userService: UsersService
	) {}
	
	@Get("/all")
	async findAll(): Promise<User[]>
	{
		return await this.userService.findAll();
	}

	@Get("/:id")
	async findOne(@Param('id') param): Promise<User | undefined>
	{
		let id: number = parseInt(param);
		if(isNaN(id))
			throw new NotFoundException();
		return await this.userService.findOne(id);
	}


}
