"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const jwt_module_1 = require("./jwt/jwt.module");
const jwt_service_1 = require("./jwt/jwt.service");
const jwt_entity_1 = require("../entities/jwt.entity");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            typeorm_1.TypeOrmModule.forFeature([jwt_entity_1.JwtEntity]),
            config_1.ConfigModule.forRoot(),
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 5,
            }),
            jwt_module_1.JwtModule,
        ],
        providers: [auth_service_1.AuthService, users_service_1.UsersService, jwt_service_1.JwtService],
        controllers: [auth_controller_1.AuthController]
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map