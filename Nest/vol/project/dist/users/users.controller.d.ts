import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly userService;
    constructor(userService: UsersService);
    findAll(): Promise<User[]>;
    findOne(param: any): Promise<User>;
    updateOne(param: any): Promise<User> | undefined;
}
