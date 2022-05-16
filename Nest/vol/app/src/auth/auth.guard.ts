
import { Injectable, CanActivate, ExecutionContext, Req, UnauthorizedException, BadRequestException, ForbiddenException, Inject, InjectableOptions, Param } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

/*
GUARD REQUIRED HEADER

{
	access_token: ${token}
}
*/

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		@Inject(UsersService)
		private readonly usersService: UsersService,
		private readonly authService: AuthService
	)
	{}

	async canActivate(
		context: ExecutionContext,
	): Promise<boolean>
	{
		const req: Request = context.switchToHttp().getRequest();
		if (req.headers['authorization'] === undefined)
			throw new BadRequestException("no Authorization field in request header");
		const target_user = await this.usersService.findUserByAccessToken(req.headers['authorization']);
		if (target_user === undefined)
			throw new ForbiddenException("Invalid access token");
		if (!await this.usersService.checkAccessTokenExpiration(target_user))
		{
			try {
				console.log("token expired, trying to refresh the token");
 				const new_token = await this.authService.validate(target_user.refresh_token_42, 'refresh_token', 'refresh_token');
				target_user.access_token_42 = new_token.access_token;
				target_user.refresh_token_42 = new_token.refresh_token;
				target_user.token_expiration_date_42 = new Date(Date.now() + new_token.expires_in * 1000);
				this.usersService.saveUser(target_user);
				console.log("retrieved new access_token");
			}
			catch(e)
				{ throw new ForbiddenException("Token expired"); }
		}
		return (true);
	}
}
