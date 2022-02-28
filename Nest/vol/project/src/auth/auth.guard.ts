
import { Injectable, CanActivate, ExecutionContext, Req, UnauthorizedException, BadRequestException, ForbiddenException, Inject, InjectableOptions } from '@nestjs/common';
import { Observable } from 'rxjs';
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
		if (req.headers['access_token'] === undefined)
			throw new BadRequestException(400, "no access_token field in request header");
		const target_user = await this.usersService.findUserByAccessToken(req.headers['access_token']);
		if (target_user === undefined)
			throw new ForbiddenException(403, "Invalid access token");
		if (!await this.usersService.checkAccessTokenExpiration(target_user))
		{
			try {
 				const new_token = await this.authService.validate(target_user.refresh_token_42);
				target_user.access_token_42 = new_token.access_token;
				target_user.refresh_token_42 = new_token.refresh_token;
				target_user.token_expiration_date_42 = new Date(Date.now() + new_token.expires_in);
			}
			catch(e)
				{ throw new ForbiddenException(403, "Token expired"); }
			throw new ForbiddenException(403, "Token expired");
		}
		return (true);
	}
}
