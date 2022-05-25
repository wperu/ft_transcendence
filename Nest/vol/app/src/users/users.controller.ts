import { Request, Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { Response } from 'express';

@Controller('users')
export class UsersController
{
	constructor(
		private readonly userService: UsersService,
	) {}
	

	@Get()
	@UseGuards(AuthGuard)
	async findAll(): Promise<User[]>
	{
		return await this.userService.findAll();
	}

	@Get("/profile/:id")
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


	@Put("/:id/username")
	//@UseGuards(AuthGuard)
	async updateUserName(@Res() response : Response, @Req() request: Request, @Body() body, @Param('id') param)
	{
		// TODO update user in service
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
		{
			return response.status(HttpStatus.NOT_FOUND).json();
		}
		
		if (await this.userService.checkAccesWithRefId(request.headers['authorization'],id) === false)
			return response.status(HttpStatus.FORBIDDEN).json({error: "Invalid access token"});

		if (body.username === undefined || body.username === "") //todo add username Rules
		{
			return response.status(HttpStatus.CONFLICT).json({error: 'no username passed'});
		}
		else
		{
			if (await this.userService.updateUserName(id, body.username) === false) //add alreay user responses
			{
				return response.status(HttpStatus.CONFLICT).json({error: 'username already use'});
			}
			else
				return response.status(HttpStatus.OK).json();
		}
	}

	/**
	 * Turn ON/OFF
	 * 
	 * you need valide google authentificator to change settings
	 * @param response 
	 * @param param 
	 * @param request 
	 * @param body 
	 * @returns 
	 */
	@Put("/:id/useTwoFactor")
	//@UseGuards(AuthGuard)
	async updateTwoFactor(@Res() response : Response, @Param('id') param, @Req() request: Request, @Body() body,)
	{
		// TODO update user in service
		console.log('Set two factor');
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
		{
		//	return response.status(HttpStatus.NOT_FOUND).json();
		}
		console.log(body['token']);


		let user = await this.userService.findUserByReferenceID(id);
		
		
		if (this.userService.checkToken(body['token'], user.SecretCode) === true)
		{
			user.setTwoFA = !user.setTwoFA;

			await this.userService.saveUser(user);
			return response.status(HttpStatus.OK); // OK
		}

		return response.status(HttpStatus.BAD_REQUEST).send('bad token'); // KO bad token
	}

	@Get("/:id/twFactorQR")
	//@UseGuards(AuthGuard)
	async getTwoFaQr(@Res() response : Response, @Param('id') param, @Body() body,)
	{
		// TODO update user in service

		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
		{
			return response.status(HttpStatus.NOT_FOUND).json();
		}

		const user = await this.userService.findUserByReferenceID(id);

		
		return (this.userService.getQR(user.SecretCode));
	}

	@Put("/:id/avatar")
	//@UseGuards(AuthGuard)
	async updateOne(@Res() response : Response, @Param('id') param)
	{
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
		{
			return response.status(HttpStatus.NOT_FOUND).json();
		}

		// TODO update user in service
		return (undefined);
	}
}
