import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
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
	
	@Get("")
	async findAll(): Promise<User[]>
	{
		return await this.userService.findAll();
	}

	@Get("/:id")
	async findOne(@Param('id') param): Promise<User | undefined>
	{
		// TODO find a better way than parseInt to check for "1672FGGF" cases
		let id: number = parseInt(param);
		if(isNaN(id))
			throw new NotFoundException();
		return await this.userService.findUserByID(id);
	}


}
