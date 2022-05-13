"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const date_fns_1 = require("date-fns");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findAll() {
        return await this.usersRepository.find();
    }
    async findUserByID(id) {
        const user = await this.usersRepository.findOne({
            where: {
                id: (0, typeorm_2.In)([id])
            },
        });
        if (user !== undefined)
            return user;
        return (undefined);
    }
    async findUserByReferenceID(reference_id) {
        const user = await this.usersRepository.findOne({
            where: {
                reference_id: (0, typeorm_2.In)([reference_id])
            },
        });
        if (user !== undefined)
            return user;
        return (undefined);
    }
    async findUserByAccessToken(access_token) {
        const user = await this.usersRepository.findOne({
            where: {
                access_token_42: access_token
            },
        });
        if (user !== undefined)
            return user;
        return (undefined);
    }
    async createUser(reference_id, username, token) {
        let user = new user_entity_1.User();
        user.reference_id = reference_id;
        user.username = username;
        user.access_token_42 = token.access_token;
        user.refresh_token_42 = token.refresh_token;
        user.token_expiration_date_42 = new Date(Date.now() + token.expires_in * 1000);
        await this.usersRepository.create(user);
        let newUser = await this.usersRepository.save(user);
        return newUser;
    }
    async checkAccessTokenExpiration(user) {
        const u = await this.usersRepository.findOne({
            where: {
                id: user.id,
                token_expiration_date_42: (0, typeorm_2.MoreThan)((0, date_fns_1.format)(Date.now(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"))
            },
        });
        if (u === undefined)
            return (false);
        return (true);
    }
    async remove(id) {
        await this.usersRepository.delete(id);
    }
    async saveUser(user) {
        return (await this.usersRepository.save(user));
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map