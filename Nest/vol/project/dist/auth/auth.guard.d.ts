import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
export declare class AuthGuard implements CanActivate {
    private readonly usersService;
    private readonly authService;
    constructor(usersService: UsersService, authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
