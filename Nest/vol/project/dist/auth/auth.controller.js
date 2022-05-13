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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService, configService, usersService) {
        this.authService = authService;
        this.configService = configService;
        this.usersService = usersService;
    }
    async login() {
        console.log("login redirection");
    }
    async callback(code, res) {
        let token = await this.authService.validate(code);
        if (token === undefined)
            throw new common_1.UnauthorizedException();
        let user = await this.authService.login(token);
        let react_code = await this.authService.generateAuthorizationCode(user.access_token_42);
        await res.redirect(301, `${this.configService.get("REACT_REDIRECT_URL")}?code=${react_code}`);
    }
    async getAccessToken(req) {
        if (req.headers['authorization-code'] === undefined)
            throw new common_1.BadRequestException("no authorization_code in request header");
        let token = await this.authService.getAccessToken(req.headers['authorization-code']);
        if (token === undefined)
            throw new common_1.ForbiddenException("wrong access code");
        return (this.usersService.findUserByAccessToken(token));
    }
};
__decorate([
    (0, common_1.Get)('/login'),
    (0, common_1.Redirect)('https://api.intra.42.fr/oauth/authorize?client_id=bf3306f6006c4a21b8c541ff8caf0218d9a896bba88a45bc6a1506b1b0b08301&redirect_uri=http%3A%2F%2Flocalhost%2Fapi%2Fauth%2Fintra42%2Fcallback&response_type=code', 301),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('/intra42/callback'),
    __param(0, (0, common_1.Query)("code")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "callback", null);
__decorate([
    (0, common_1.Post)('/token'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAccessToken", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService,
        users_service_1.UsersService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map