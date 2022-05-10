import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    private readonly usersService;
    constructor(authService: AuthService, configService: ConfigService, usersService: UsersService);
    login(): Promise<void>;
    callback(code: string, res: any): Promise<void>;
    getAccessToken(req: any): Promise<User | undefined>;
}
