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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const auth_service_1 = require("./auth.service");
let AuthGuard = class AuthGuard {
    constructor(usersService, authService) {
        this.usersService = usersService;
        this.authService = authService;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        if (req.headers['authorization'] === undefined)
            throw new common_1.BadRequestException("no Authorization field in request header");
        const target_user = await this.usersService.findUserByAccessToken(req.headers['authorization']);
        if (target_user === undefined)
            throw new common_1.ForbiddenException("Invalid access token");
        if (!await this.usersService.checkAccessTokenExpiration(target_user)) {
            try {
                console.log("token expired, trying to refresh the token");
                const new_token = await this.authService.validate(target_user.refresh_token_42, 'refresh_token', 'refresh_token');
                target_user.access_token_42 = new_token.access_token;
                target_user.refresh_token_42 = new_token.refresh_token;
                target_user.token_expiration_date_42 = new Date(Date.now() + new_token.expires_in * 1000);
                this.usersService.saveUser(target_user);
                console.log("retrieved new access_token");
            }
            catch (e) {
                throw new common_1.ForbiddenException("Token expired");
            }
        }
        return (true);
    }
};
AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(users_service_1.UsersService)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        auth_service_1.AuthService])
], AuthGuard);
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth.guard.js.map