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
exports.DisplayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const display_service_1 = require("./display.service");
const display_info_dto_1 = require("./dto/display-info.dto");
let DisplayController = class DisplayController {
    constructor(displayService) {
        this.displayService = displayService;
    }
    create(dto) {
        return this.displayService.save(dto);
    }
    findAll(sessionId) {
        if (sessionId)
            return this.displayService.findBySession(sessionId);
        return this.displayService.findAll();
    }
    findOne(id) {
        return this.displayService.findById(id);
    }
    remove(id) {
        this.displayService.delete(id);
    }
};
exports.DisplayController = DisplayController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Submit detected display info from the client' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [display_info_dto_1.CreateDisplayInfoDto]),
    __metadata("design:returntype", void 0)
], DisplayController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all stored display records' }),
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: false, description: 'Filter by session' }),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisplayController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single display record' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Display record UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisplayController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a display record' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Display record UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisplayController.prototype, "remove", null);
exports.DisplayController = DisplayController = __decorate([
    (0, swagger_1.ApiTags)('display'),
    (0, common_1.Controller)('display'),
    __metadata("design:paramtypes", [display_service_1.DisplayService])
], DisplayController);
//# sourceMappingURL=display.controller.js.map