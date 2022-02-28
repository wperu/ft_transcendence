
import { Injectable, CanActivate, ExecutionContext, Req, UnauthorizedException, BadRequestException, ForbiddenException, Inject, InjectableOptions } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

/*
GUARD REQUIRED HEADER

{
	access_token: ${token}
}
*/

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		@Inject(UsersService) private readonly usersService: UsersService
	)
	{}

	async canActivate(
		context: ExecutionContext,
	): Promise<boolean>
	{
		const req: Request = context.switchToHttp().getRequest();
		if (req.headers['access_token'] === undefined)
			throw new BadRequestException();
		const target_user = await this.usersService.findUserByAccessToken(req.headers['access_token']);
		if (target_user === undefined)
			throw new ForbiddenException(403, "Invalid access token");
		if (!await this.usersService.checkAccessTokenExpiration(target_user))
		{
			try {
 				// TODO refresh
			}
			catch(e)
				{ throw new ForbiddenException(403, "Token expired"); }
			throw new ForbiddenException(403, "Token expired");
		}
		return (true);
	}
}
