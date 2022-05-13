import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findAll(): Promise<User[]>;
    findUserByID(id: number): Promise<User | undefined>;
    findUserByReferenceID(reference_id: number): Promise<User | undefined>;
    findUserByAccessToken(access_token: string): Promise<User | undefined>;
    createUser(reference_id: number, username: string, token: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }): Promise<User>;
    checkAccessTokenExpiration(user: User): Promise<boolean>;
    remove(id: string): Promise<void>;
    saveUser(user: User): Promise<User>;
}
