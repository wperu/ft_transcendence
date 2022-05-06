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
var JwtService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_entity_1 = require("../../entities/jwt.entity");
let JwtService = JwtService_1 = class JwtService {
    constructor(jwtRepository) {
        this.jwtRepository = jwtRepository;
    }
    static generateCode() {
        return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, (c) => {
            const r = Math.floor(Math.random() * 16);
            return r.toString(16);
        });
    }
    async generateCode(access_token) {
        let double_check = await this.jwtRepository.findOne({
            where: {
                code: (0, typeorm_2.In)([access_token]),
            }
        });
        if (double_check !== undefined)
            this.jwtRepository.delete(double_check);
        let jwt = new jwt_entity_1.JwtEntity();
        jwt.code = JwtService_1.generateCode();
        jwt.token = access_token;
        let token_pair = await this.jwtRepository.create(jwt);
        await this.jwtRepository.save(token_pair);
        return (token_pair.code);
    }
    async getAccessToken(code) {
        let access_token = await this.jwtRepository.findOne({
            where: {
                code: (0, typeorm_2.In)([code]),
            }
        });
        if (access_token === undefined)
            return (undefined);
        return (access_token.token);
    }
    async deleteAccessCode(code) {
        let access_token = await this.jwtRepository.findOne({
            where: {
                code: (0, typeorm_2.In)([code]),
            }
        });
        if (access_token !== undefined)
            this.jwtRepository.delete(access_token);
    }
};
JwtService = JwtService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(jwt_entity_1.JwtEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], JwtService);
exports.JwtService = JwtService;
//# sourceMappingURL=jwt.service.js.map