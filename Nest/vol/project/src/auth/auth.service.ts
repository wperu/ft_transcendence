import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import FormData = require("form-data")
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entity/user.entity';

@Injectable()
export class AuthService {
    constructor (
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
    ) {}

    // TODO add mechanism for refreshing the token        

    async validate (access_code: string)
    : Promise<{
        access_token: string,
        refresh_token: string,
        expires_in: number,
    }> | undefined
    {
        try
        {
            var form = new FormData();
            form.append('grant_type', 'authorization_code');
            form.append('client_id', this.configService.get<string>("CLIENT_ID"));
            form.append('client_secret', this.configService.get<string>("CLIENT_SECRET"));
            form.append('code', access_code);
            form.append('redirect_uri', 'http://localhost:3000/auth/intra42/callback');

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
				throw new UnauthorizedException();
			}
            console.log("got access token");
            return (response.data);
        }
        catch (e)
        {
            throw new UnauthorizedException();
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
        if (user == undefined)
        {
            console.log("Unknown user, creating it...");
            user = await this.usersService.createUser(info.data.id, info.data.login, token);
        }
        else
            console.log("User " + user.username + " logged in");
        return (user);
    }
}
