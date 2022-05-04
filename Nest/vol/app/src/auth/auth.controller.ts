import { Controller, Redirect, Get, Query, UnauthorizedException, Res, UseGuards, Req, ForbiddenException, BadRequestException, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { randomInt } from 'crypto';
import { resolveSoa } from 'dns';
import { ServerResponse } from 'http';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

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
    @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=bf3306f6006c4a21b8c541ff8caf0218d9a896bba88a45bc6a1506b1b0b08301&redirect_uri=https%3A%2F%2Flocalhost%2Fapi%2Fauth%2Fintra42%2Fcallback&response_type=code', 301)
    async   login()
    {
        console.log("login redirection");
    }


    @Get('/intra42/callback')
    async   callback(@Query("code") code: string, @Res() res: any)
    {
        let token = await this.authService.validate(code);
        if (token === undefined)
            throw new UnauthorizedException();
        
        let user = await this.authService.login(token);

        let react_code: string = await this.authService.generateAuthorizationCode(user.access_token_42);
        await res.redirect(301, `${this.configService.get<string>("REACT_REDIRECT_URL")}?code=${react_code}`);
    }


    @Post('/token')
    async   getAccessToken(@Req() req) : Promise<User | undefined>
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

        console.log (`Created new DEV user with Username \"${req.headers["username"]}\"`);

        let user = await this.usersService.createUser(randomInt(10000), req.headers['username'], fake_token);
        return (user);
    }
}