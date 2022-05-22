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

@Controller('auth')
export class AuthController
{
    constructor (
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    )
    {}


    @Get('/login')
    @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=bb0e2df66549b7a90ccfb9ae53736366337e6be09540ac731757e0d38f14978a&redirect_uri=https%3A%2F%2Flocalhost%2Fapi%2Fauth%2Fintra42%2Fcallback&response_type=code', 301)
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

        await res.redirect(301, `${this.configService.get<string>("REACT_REDIRECT_URL")}?code=${react_code}&register=${user.username === null}`);
    }


    @Post('/token')
    async   getAccessToken(@Req() req, @Body() body) : Promise<User | undefined>
    {
        if (req.headers['authorization-code'] === undefined)
            throw new BadRequestException("no authorization_code in request header");
        /* verify if code is valid and non expired */
        let token = await this.authService.getAccessToken(req.headers['authorization-code']);
        if (token === undefined)
            throw new ForbiddenException("wrong access code");
        /* validates user, deletes code */
        return (this.usersService.findUserByAccessToken(token));
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
        /* validates user, deletes code */
        let user = await this.usersService.findUserByAccessToken(token);
		if (user === undefined)
			throw new ForbiddenException("wrong access code");
		if (user.username !== null)
			throw new ForbiddenException("Already register !");

		let username = req.body['username'];
		if (username === undefined)
			throw new BadRequestException('no username in body');
		
		user.username = username; //fix rule to username;

		await this.usersService.saveUser(user);

		return ;
    }

    @Post('/dev-user')
    async   createDevUser(@Req() req) : Promise<User | undefined>
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
            return (user);
        }

        console.log (`Created new DEV user with Username \"${req.headers["username"]}\"`);
        return (await this.usersService.createUser(randomInt(10000), req.headers['username'], fake_token));
    }
}