import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TokenValidatorEntity } from '../entities/token_validator.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService
{
    constructor (
        @InjectRepository(TokenValidatorEntity)
        private readonly tokenRepository: Repository<TokenValidatorEntity>,

        private readonly jwtService: JwtService
    ) {}


    /* Generates a random code string */
    static  generateCode() : string
    {
        return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, (c) => {  
            const r = Math.floor(Math.random() * 16);  
            return r.toString(16);  
        });
    }


    /* generates pair of uid / token in database, and return the access_code */
    async   generateCode(access_token: string) : Promise<string>
    {
        let double_check = await this.tokenRepository.findOne({
            where: {
                code: In([access_token]),
            }
        });
        if (double_check !== undefined)
            this.tokenRepository.delete(double_check);

        let jwt = new TokenValidatorEntity();
        jwt.code = TokenService.generateCode();
        jwt.token = access_token;
        let token_pair = await this.tokenRepository.create(jwt);
        await this.tokenRepository.save(token_pair);
        return (token_pair.code);
    }


    generateToken(data: Object) : string
    {
        return (this.jwtService.sign(data));
    }

    verifyToken(token: string) : any
    {
        return (this.jwtService.verifyAsync(token));
    }
   
    decodeToken(token: string) : Object
    {
        return (this.jwtService.decode(token));
    }


    /* tryes to fetch access token from database using code */
    async   getAccessToken(code: string) : Promise<string | undefined>
    {
        let access_token = await this.tokenRepository.findOne({
            where: {
                code: In([code]),
            }
        });
        
        if (access_token === undefined)
            return (undefined);
        return (access_token.token);
    }

    

    async  deleteAccessCode(code: string)
    {
        let access_token = await this.tokenRepository.findOne({
            where: {
                code: In([code]),
            }
        });
        
        if (access_token !== undefined)
            this.tokenRepository.delete(access_token);
    }
}
