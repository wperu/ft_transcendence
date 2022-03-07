import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JwtEntity } from '../../entities/jwt.entity';

@Injectable()
export class JwtService
{
    constructor (
        @InjectRepository(JwtEntity)
        private readonly jwtRepository: Repository<JwtEntity>
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
        let double_check = await this.jwtRepository.findOne({
            where: {
                code: In([access_token]),
            }
        });
        if (double_check !== undefined)
            this.jwtRepository.delete(double_check);

        let jwt = new JwtEntity();
        jwt.code = JwtService.generateCode();
        jwt.token = access_token;
        let token_pair = await this.jwtRepository.create(jwt);
        await this.jwtRepository.save(token_pair);
        return (token_pair.code);
    }


    /* tryes to fetch access token from database using code */
    async   getAccessToken(code: string) : Promise<string | undefined>
    {
        let access_token = await this.jwtRepository.findOne({
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
        let access_token = await this.jwtRepository.findOne({
            where: {
                code: In([code]),
            }
        });
        
        if (access_token !== undefined)
            this.jwtRepository.delete(access_token);
    }
}
