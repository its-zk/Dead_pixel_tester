"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PixelTestModule = void 0;
const common_1 = require("@nestjs/common");
const pixel_test_controller_1 = require("./pixel-test.controller");
const pixel_test_service_1 = require("./pixel-test.service");
let PixelTestModule = class PixelTestModule {
};
exports.PixelTestModule = PixelTestModule;
exports.PixelTestModule = PixelTestModule = __decorate([
    (0, common_1.Module)({
        controllers: [pixel_test_controller_1.PixelTestController],
        providers: [pixel_test_service_1.PixelTestService],
        exports: [pixel_test_service_1.PixelTestService],
    })
], PixelTestModule);
//# sourceMappingURL=pixel-test.module.js.map