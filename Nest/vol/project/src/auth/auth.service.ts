import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import FormData = require("form-data")
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor (
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
    ) {}

    async validate (access_code: string) : Promise<string>
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
				console.log("no access_token");
				throw new UnauthorizedException();
			}
            console.log("got access token");
            let token = {
                access: response.data.access_token,
                refresh: response.data.refresh_token,
                expires_in: response.data.expires_in,
            }
            const info = await firstValueFrom(this.httpService
				.get(
					"https://api.intra.42.fr/v2/me",
					{ 
						headers: {
							'Authorization': `Bearer ${token.access}`
						}
					}
            	)
			);

            console.log("got intranet informations, creating user");
            // TODO verify if client is already in database
			this.usersService.createUser(info.data.id, info.data.login, token);
        }
        catch (e)
        {
            throw new UnauthorizedException();
        }
        return ("");
    }
}
