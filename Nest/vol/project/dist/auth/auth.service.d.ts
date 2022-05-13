import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/user.entity';
import { JwtService } from './jwt/jwt.service';
export declare class AuthService {
    private readonly httpService;
    private readonly configService;
    private readonly usersService;
    private readonly jwtService;
    constructor(httpService: HttpService, configService: ConfigService, usersService: UsersService, jwtService: JwtService);
    validate(access_code: string, grant?: string, data?: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }> | undefined;
    login(token: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }): Promise<User>;
    generateAuthorizationCode(access_token: string): Promise<string>;
    getAccessToken(code: string): Promise<string | undefined>;
}
