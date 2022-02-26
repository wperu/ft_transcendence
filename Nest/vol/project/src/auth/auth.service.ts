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
			if(!response.data["access_token"])
			{
				console.log("no access_token");
				throw new UnauthorizedException();
			}
			let access_token = response.data.access_token;
            const info = await firstValueFrom(this.httpService
				.get(
					"https://api.intra.42.fr/v2/me",
					{ 
						headers: {
							'Authorization': `Bearer ${access_token}`
						}
					}
            	)
			);
            // TODO verify if client is already in database
			this.usersService.createUser(info.data.id, info.data.login, access_token);
        }
        catch (e)
        {
            throw new UnauthorizedException();
        }
        return ("");
    }
}
