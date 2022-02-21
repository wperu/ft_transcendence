import { Body, Controller, Get, Post } from '@nestjs/common';
import { json } from 'stream/consumers';
import { get } from 'superagent';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController
{
	constructor(private readonly userService: UsersService) {}
	
	@Get()
	async findAll(): Promise<User[]>
	{
		return await this.userService.findAll();
	}

	@Post()
	async postUser(@Body() newUser: UserDto )
	{
		
		return await this.userService.addOne(newUser);
	}

}
