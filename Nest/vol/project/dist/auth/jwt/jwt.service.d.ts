import { Repository } from 'typeorm';
import { JwtEntity } from '../../entities/jwt.entity';
export declare class JwtService {
    private readonly jwtRepository;
    constructor(jwtRepository: Repository<JwtEntity>);
    static generateCode(): string;
    generateCode(access_token: string): Promise<string>;
    getAccessToken(code: string): Promise<string | undefined>;
    deleteAccessCode(code: string): Promise<void>;
}
