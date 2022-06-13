import { Controller, Redirect, Get, Query, UnauthorizedException, Res, UseGuards, Req, ForbiddenException, BadRequestException, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { randomInt } from 'crypto';
import { resolveSoa } from 'dns';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import IUser from 'src/Common/Dto/User/User';
import { TwoFactorService } from './auth.twoFactor.service';

@Controller('auth')
export class AuthController
{
    constructor (
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
		private readonly twoFactorService: TwoFactorService,
    )
    {}

    @Get('/login')
    @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=c55b161b105ca533c4973f12ee73ccfba2b2dd584a4bdad361e6317ac8811d92&redirect_uri=https%3A%2F%2F10.3.10.1%2Fapi%2Fauth%2Fintra42%2Fcallback&response_type=code', 301)
    async   login()
    {
        console.log("login redirection");
    }


    @Get('/intra42/callback')
    async   callback(@Query("code") code: string, @Res() res : Response)
    {
        let token = await this.authService.validate(code);
        if (token === undefined)
            throw new UnauthorizedException();
        
        let user = await this.authService.login(token);

        let react_code: string = await this.authService.generateAuthorizationCode(user.access_token_42);

        await res.redirect(301, `${this.configService.get<string>("REACT_REDIRECT_URL")}?code=${react_code}&register=${user.username === null}&useTwoFactor=${user.setTwoFA}`);
    }

    @Post('/token')
    async   getAccessToken(@Req() req, @Body() body : Body) : Promise<IUser | undefined>
    {
		if (req.headers['authorization-code'] === undefined)
			throw new BadRequestException("no authorization_code in request header");
		/* verify if code is valid and non expired */
		let token = await this.authService.getAccessToken(req.headers['authorization-code']);
		if (token === undefined)
			throw new ForbiddenException("wrong access code");

		const user = await this.usersService.findUserByAccessToken(token);
		if (user === undefined)
			return;	//todo error
		
		if (user.setTwoFA === true)
		{
			if (body['token'] === undefined)
				throw new ForbiddenException("2FA: no token send");
			if (this.twoFactorService.isValide(body['token'], user.SecretCode) === false)
				throw new ForbiddenException("2FA: bad token send");
		}
		/* validates user, deletes code */
		this.authService.destroyAccessToken(req.headers['authorization-code']);
		return this.usersService.getIUserFromUser(user);
    }

	@Post('/register')
    async   register(@Req() req) : Promise<void | undefined>
    {
        if (req.headers['authorization-code'] === undefined)
			throw new BadRequestException("no authorization_code in request header");

        /* verify if code is valid and non expired */
        let token = await this.authService.getAccessToken(req.headers['authorization-code']);
        if (token === undefined)
			throw new ForbiddenException("wrong access code");
        /* validates user */
        let user = await this.usersService.findUserByAccessToken(token);
		if (user === undefined)
			throw new ForbiddenException("wrong access code");
		if (user.username !== null)
			throw new ForbiddenException("Already register !");

		const username = req.body['username'];
		if (username === undefined)
			throw new BadRequestException('no username in body !');
		if (this.usersService.isValideUsername(username) === false)
			throw new BadRequestException('Username bad format !');

		user.username = username;
		await this.usersService.saveUser(user);
		return ;
    }

    @Post('/dev-user')
    async   createDevUser(@Req() req) : Promise<IUser | undefined>
    {
        let fake_token = {
            access_token: "F4KE",
            refresh_token: "F4KE",
            expires_in: 42
        };
        if (req.headers['username'] === undefined)
        {
            throw new BadRequestException("no field username in request");
        }


        let user = await this.usersService.findUserByName(req.headers['username']);
        if (user !== undefined)
        {
            console.log (`Logged back new DEV user \"${req.headers["username"]}\"`);
            return this.usersService.getIUserFromUser(user);
        }

        console.log (`Created new DEV user with Username \"${req.headers["username"]}\"`);
        return this.usersService.getIUserFromUser(await this.usersService.createUser(randomInt(10000), req.headers['username'], fake_token));
    }
}