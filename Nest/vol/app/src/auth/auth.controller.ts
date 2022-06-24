import { Controller, Get, Query, UnauthorizedException, Res, Req, ForbiddenException, BadRequestException, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { UsersService } from 'src/users/users.service';
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
    {
		
	}

	private readonly redirect_url: string = process.env.REDIRECT_URL;
	
    @Get('/login')
   // @Redirect(this.redirect_url || "", 301)
    async   login(@Res() res : Response)
    {
		res.redirect(301, this.redirect_url);
    }


    @Get('/intra42/callback')
    async   callback(@Query("code") code: string, @Res() res : Response)
    {
        let token = await this.authService.validate(code);
        if (token === undefined)
            throw new UnauthorizedException();
        
        let user = await this.authService.login(token);

        let react_code: string = await this.authService.generateAuthorizationCode(user.access_token);

        res.redirect(301, `${this.configService.get<string>("REACT_REDIRECT_URL")}?code=${react_code}&register=${user.username === null}&useTwoFactor=${user.setTwoFA}`);
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
			throw new ForbiddenException("Already registered !");

		const username = req.body['username'];
		if (username === undefined)
			throw new BadRequestException('no username in body !');
		if (this.usersService.isValideUsername(username) === false)
			throw new BadRequestException('Username bad format !');
        if (await this.usersService.findUserByName(username) !== undefined)
			throw new ForbiddenException("Username already in use");

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