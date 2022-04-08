import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import FormData = require("form-data");
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/user.entity';
import { JwtService } from './jwt/jwt.service';

@Injectable()
export class AuthService {
    constructor (
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,

        @Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,

        @Inject(forwardRef(() => JwtService))
        private readonly jwtService: JwtService,
    ) {}


    async validate (access_code: string, grant: string = 'authorization_code', data: string = 'code')
    : Promise<{
        access_token: string,
        refresh_token: string,
        expires_in: number,
    }> | undefined
    {
        try
        {
            var form = new FormData(undefined);
            form.append('grant_type', grant);
            form.append('client_id', this.configService.get<string>("CLIENT_ID"));
            form.append('client_secret', this.configService.get<string>("CLIENT_SECRET"));
            form.append(data, access_code);
            form.append('redirect_uri', "http://localhost/api/auth/intra42/callback");
			//console.log(process.env.ORIGIN_URL + '/api/auth/intra42/callback');
            const response = await firstValueFrom(this.httpService
				.post(
                    this.configService.get<string>('AUTHTOKEN_URL'),
                    form,
                    { headers: form.getHeaders() }
                )
            );
			if(!response.data["access_token"] || !response.data["refresh_token"] || !response.data["expires_in"])
			{
				console.log("no access token");
				throw new UnauthorizedException("api response did not contain access_token or refresh_token or expires_in fields");
			}
            console.log("got access token");
            return (response.data);
        }
        catch (e)
        {
			//console.log(e);
			throw new UnauthorizedException("unauthorized from 42intra");
        }
    }



    async login(token: {
        access_token: string,
        refresh_token: string,
        expires_in: number,
    }): Promise<User>
    {
        const info = await firstValueFrom(this.httpService
            .get(
                "https://api.intra.42.fr/v2/me",
                { 
                    headers: {
                        'Authorization': `Bearer ${token.access_token}`
                    }
                }
            )
        );

        let user: User = await this.usersService.findUserByReferenceID(info.data.id)
        if (user === undefined)
        {
            console.log("Unknown user, creating it...");
            user = await this.usersService.createUser(info.data.id, info.data.login, token);
        }
        else
        {
            user.access_token_42 = token.access_token;
            user.refresh_token_42 = token.refresh_token;
            user.token_expiration_date_42 = new Date(Date.now() + token.expires_in * 1000);
            this.usersService.saveUser(user);
            console.log("User " + user.username + " logged in");
        }
        return (user);
    }



    async generateAuthorizationCode(access_token: string) : Promise<string>
    {
        return (await this.jwtService.generateCode(access_token));
    }



    async getAccessToken(code: string) : Promise<string | undefined>
    {
        let access_token = await this.jwtService.getAccessToken(code);
        this.jwtService.deleteAccessCode(code);
        return (access_token);
    }
}



