import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	NotFoundException,
	ForbiddenException,
	Param,
	Post,
	Put,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	Logger,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlink, createReadStream } from 'fs';
import * as path from "path";
import * as sharp from "sharp";
import { IProfileDTO } from "../Common/Dto/User/ProfileDTO";
import { request } from 'http';

@Controller('users')
export class UsersController
{
	constructor(
		private readonly userService: UsersService,
		
	) {}
	private logger: Logger = new Logger('UserController');

	@Get("/profile/:id")
	@UseGuards(AuthGuard)
	async findOne(@Param('id') param): Promise<IProfileDTO>
	{
		this.logger.log('GET /profile/' + param);
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
			throw new NotFoundException();


		let user = await this.userService.findUserByReferenceID(id);
		if (user === undefined)
			throw new NotFoundException();
		return (this.userService.getProfileFromUser(user));
	}

	/**
	 * PUT request to Update username
	 * @param response
	 * @param request
	 * @param body
	 * @param param
	 * @returns
	 */
	@Put("/:id/username")
	@UseGuards(AuthGuard)
	async updateUserName(@Res() response : Response, @Req() request: Request, @Body() body, @Param('id') param)
	{
		this.logger.log('PUT /'+ param + '/username');
		// TODO update user in service
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
		{
			throw new NotFoundException();
		}
		if (await this.userService.checkAccesWithRefId(request.headers['authorization'], id) === false)
			throw new ForbiddenException("wrong access code");
		if (body['username'] === undefined || body['username'] === "")
			throw new BadRequestException('no username passed !');
		else if (this.userService.isValideUsername(body['username']) === false)
			throw new BadRequestException('Username bad format !');
		else if (await this.userService.updateUserName(id, body['username']) === false) //add alreay user responses
			throw new BadRequestException('username already use');

		return response.status(HttpStatus.OK).json();
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
	@UseGuards(AuthGuard)
	async updateTwoFactor(@Param('id') param, @Req() request: Request, @Body() body) : Promise<undefined>
	{
		this.logger.log('PUT /' + param + '/useTwoFactor');
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
			throw new NotFoundException();

		let user = await this.userService.findUserByReferenceID(id);
		if (await this.userService.checkAccesWithRefId(request.headers['authorization'], id) === false)
			throw new ForbiddenException("wrong access code");

		if (this.userService.checkToken(body['token'], user.SecretCode) === false)
			throw new BadRequestException("wrong token code"); // KO bad token

		user.setTwoFA = !user.setTwoFA;
		await this.userService.saveUser(user);
		return undefined; // OK
	}

	@Get("/:id/twFactorQR")
	@UseGuards(AuthGuard)
	async getTwoFaQr(@Param('id') param, @Body() body, @Req() request: Request, @Res() response: Response)
	{
		this.logger.log('GET /' + param + '/twFactorQR');
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
		{
			throw new NotFoundException();
		}

		const user = await this.userService.findUserByReferenceID(id);
		if (await this.userService.checkAccesWithRefId(request.headers['authorization'], id) === false)
			throw new ForbiddenException("wrong access code");

		const url = this.userService.getQR(user.SecretCode);

		return response.status(HttpStatus.OK).json({ url: url});
	}

	@Post("/:id/avatar")
	@UseGuards(AuthGuard)
	@UseInterceptors(FileInterceptor('avatar', {
		storage: diskStorage({
			destination: './avatars'
		})
	}))
	async updateAvatar(
		@UploadedFile() file: Express.Multer.File,
		@Res() response : Response,
		@Param('id') param,
		@Req() request,
	)
	{
		this.logger.log('POST /' + param + '/avatar');
		let	old_avatar : string | undefined;
		let id: number = parseInt(param);

		if(isNaN(id) || !/^\d*$/.test(param))
		{
			unlink(file.path, (err) => {
				if (err)
					console.error("Failed deleting received file");
			});
			throw new NotFoundException();
		}
		else
		{
			if (await this.userService.checkAccesWithRefId(request.headers['authorization'], id) === false)
				throw new ForbiddenException("wrong access code");

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
						console.error("Failed deleting received file: " + err);
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
			})
			.catch(error => {
				if (error)
				{
					console.error(error);
					return (response.status(415).json());
				}
			})
		}
		return (response.status(201).json());
	}

	@Get("/:id/avatar")
	async getAvatar(@Res() response: Response, @Param('id') param)
	{
		this.logger.log('GET /' + param + '/avatar');
		let id: number = parseInt(param);
		if(isNaN(id) || !/^\d*$/.test(param))
			throw new NotFoundException();
		let path : string = await this.userService.getAvatarPathByRefId(id);
		if (path === null)
			throw new NotFoundException();
		const file = createReadStream(path);
		file.pipe(response);
		return (response);
	}
}
