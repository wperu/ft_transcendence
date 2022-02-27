import { Controller, Redirect, Get, Query, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController
{
    constructor (
        private readonly authService: AuthService
    )
    {}

    @Get('/login')
    @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=c163a93fae62bc41d5f2f8fd76fdba2a06bb576d2802e6842f2f0f8d161cc9a0&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fintra42%2Fcallback&response_type=code', 301)
    async login()
    {
        console.log("login redirection");
    }


    @Get('/intra42/callback')
    async callback(@Query("code") code: string)
    {
        let token = await this.authService.validate(code);
        if (token === undefined)
            throw new UnauthorizedException();
        
        let user = await this.authService.login(token);
    }
}
