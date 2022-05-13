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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const config_1 = require("@nestjs/config");
const FormData = require("form-data");
const users_service_1 = require("../users/users.service");
const jwt_service_1 = require("./jwt/jwt.service");
let AuthService = class AuthService {
    constructor(httpService, configService, usersService, jwtService) {
        this.httpService = httpService;
        this.configService = configService;
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validate(access_code, grant = 'authorization_code', data = 'code') {
        try {
            var form = new FormData(undefined);
            form.append('grant_type', grant);
            form.append('client_id', this.configService.get("CLIENT_ID"));
            form.append('client_secret', this.configService.get("CLIENT_SECRET"));
            form.append(data, access_code);
            form.append('redirect_uri', process.env.ORIGIN_URL + '/api/auth/intra42/callback');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService
                .post(this.configService.get('AUTHTOKEN_URL'), form, { headers: form.getHeaders() }));
            if (!response.data["access_token"] || !response.data["refresh_token"] || !response.data["expires_in"]) {
                console.log("no access token");
                throw new common_1.UnauthorizedException("api response did not contain access_token or refresh_token or expires_in fields");
            }
            console.log("got access token");
            return (response.data);
        }
        catch (e) {
            throw new common_1.UnauthorizedException("unauthorized from 42intra");
        }
    }
    async login(token) {
        const info = await (0, rxjs_1.firstValueFrom)(this.httpService
            .get("https://api.intra.42.fr/v2/me", {
            headers: {
                'Authorization': `Bearer ${token.access_token}`
            }
        }));
        let user = await this.usersService.findUserByReferenceID(info.data.id);
        if (user === undefined) {
            console.log("Unknown user, creating it...");
            user = await this.usersService.createUser(info.data.id, info.data.login, token);
        }
        else {
            user.access_token_42 = token.access_token;
            user.refresh_token_42 = token.refresh_token;
            user.token_expiration_date_42 = new Date(Date.now() + token.expires_in * 1000);
            this.usersService.saveUser(user);
            console.log("User " + user.username + " logged in");
        }
        return (user);
    }
    async generateAuthorizationCode(access_token) {
        return (await this.jwtService.generateCode(access_token));
    }
    async getAccessToken(code) {
        let access_token = await this.jwtService.getAccessToken(code);
        this.jwtService.deleteAccessCode(code);
        return (access_token);
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => jwt_service_1.JwtService))),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        users_service_1.UsersService,
        jwt_service_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map