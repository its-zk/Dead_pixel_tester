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
exports.PixelTestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pixel_test_service_1 = require("./pixel-test.service");
const pixel_test_dto_1 = require("./dto/pixel-test.dto");
let PixelTestController = class PixelTestController {
    constructor(pixelTestService) {
        this.pixelTestService = pixelTestService;
    }
    getTestColors() {
        return this.pixelTestService.getTestColors();
    }
    start(dto) {
        return this.pixelTestService.start(dto);
    }
    findAll(sessionId) {
        if (sessionId)
            return this.pixelTestService.findBySession(sessionId);
        return this.pixelTestService.findAll();
    }
    findOne(id) {
        return this.pixelTestService.findById(id);
    }
    summary(id) {
        return this.pixelTestService.getSummary(id);
    }
    reportPixels(id, dto) {
        return this.pixelTestService.reportPixels(id, dto);
    }
    advanceColor(id, dto) {
        return this.pixelTestService.advanceColor(id, dto);
    }
    complete(id, dto) {
        return this.pixelTestService.complete(id, dto);
    }
    abandon(id) {
        return this.pixelTestService.abandon(id);
    }
};
exports.PixelTestController = PixelTestController;
__decorate([
    (0, common_1.Get)('colors'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the list of test colors used for dead-pixel detection' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PixelTestController.prototype, "getTestColors", null);
__decorate([
    (0, common_1.Post)('start'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Start a new dead-pixel test session' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pixel_test_dto_1.StartPixelTestDto]),
    __metadata("design:returntype", void 0)
], PixelTestController.prototype, "start", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all pixel test sessions' }),
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: false }),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PixelTestController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a pixel test session' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PixelTestController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get test summary and defect counts' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PixelTestController.prototype, "summary", null);
__decorate([
    (0, common_1.Patch)(':id/pixels'),
    (0, swagger_1.ApiOperation)({ summary: 'Report dead/stuck/hot pixels found during a color step' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pixel_test_dto_1.ReportDeadPixelsDto]),
    __metadata("design:returntype", void 0)
], PixelTestController.prototype, "reportPixels", null);
__decorate([
    (0, common_1.Patch)(':id/color'),
    (0, swagger_1.ApiOperation)({ summary: 'Advance to the next color index' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pixel_test_dto_1.UpdateColorIndexDto]),
    __metadata("design:returntype", void 0)
], PixelTestController.prototype, "advanceColor", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark the test as completed' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pixel_test_dto_1.CompletePixelTestDto]),
    __metadata("design:returntype", void 0)
], PixelTestController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/abandon'),
    (0, swagger_1.ApiOperation)({ summary: 'Abandon the test session' }),
    (0, swagger_1.ApiParam)({ name: 'id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PixelTestController.prototype, "abandon", null);
exports.PixelTestController = PixelTestController = __decorate([
    (0, swagger_1.ApiTags)('pixel-test'),
    (0, common_1.Controller)('pixel-test'),
    __metadata("design:paramtypes", [pixel_test_service_1.PixelTestService])
], PixelTestController);
//# sourceMappingURL=pixel-test.controller.js.map