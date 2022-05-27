import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	NotFoundException,
	Param,
	Post,
	Put,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlink, createReadStream } from 'fs';
import * as path from "path";
import * as sharp from "sharp";

@Controller('users')
export class UsersController
{
	constructor(
		private readonly userService: UsersService,
		// private readonly sharpService: SharpService
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

		if (await this.userService.checkAccesWithRefId(request.header['authorization'],id) === false)
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

	@Put("/:id/useTwoFactor")
	//@UseGuards(AuthGuard)
	async updateTwoFactor(@Res() response : Response, @Param('id') param)
	{
		// TODO update user in service

		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
		{
			return response.status(HttpStatus.NOT_FOUND).json();
		}


		return (undefined);
	}

	@Post("/:id/avatar")
	//@UseGuards(AuthGuard)
	@UseInterceptors(FileInterceptor('avatar', {
		storage: diskStorage({
			destination: './avatars'
		})
	}))
	async updateAvatar(
		@UploadedFile() file: Express.Multer.File,
		@Res() response : Response,
		@Param('id') param
	)
	{
		let	old_avatar : string | undefined;
		let id: number = parseInt(param);

		if(isNaN(id) || !/^\d*$/.test(param))
		{
			unlink(file.path, (err) => {
				if (err)
					console.error("Failed deleting received file");
			});
			return (response.status(HttpStatus.NOT_FOUND).json());
		}
		else
		{
			const extension = file.originalname.split('.');
			var filename = "./avatars/";
			filename += Date.now() + '-';
			filename += Math.round(Math.random() * 1E9);
			filename += '.' + extension[extension.length - 1];
			await sharp(file.path)
			.resize(300, 300)
			.toFile(filename)
			.then(async () => {
				unlink(file.path, (err) => {
					if (err)
					{
						console.error("Failed deleting received file: " + err);
						return (response.status(500));
					}
				});
				console.log("Changing avatar path to : [" + filename + "]");
				old_avatar = await this.userService.updateAvatar(param, filename);
				if (old_avatar !== undefined && old_avatar !== null)
				{
					if (path.basename(path.dirname(old_avatar)) !== "defaults")
					{
						unlink(old_avatar, (err) => {
							if (err)
								console.error("Old avatar didn't exist");
							else
								console.log('Old avatar deleted');
						});
					}
					else
						console.log("Old avatar was a default one");
				}
			});
		}
		return (response.status(201).json());
	}

	@Get("/:id/avatar")
		async getAvatar(@Res() response: Response, @Param('id') param)
	{
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
			return (response.status(HttpStatus.NOT_FOUND).json());
		let path : string = await this.userService.getAvatarPathById(id);
		const file = createReadStream(path);
		file.pipe(response);
		return (response);
	}
}
