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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateColorIndexDto = exports.CompletePixelTestDto = exports.ReportDeadPixelsDto = exports.DeadPixelLocationDto = exports.StartPixelTestDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class StartPixelTestDto {
}
exports.StartPixelTestDto = StartPixelTestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID linking to display info' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartPixelTestDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the display info record' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartPixelTestDto.prototype, "displayInfoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Logical screen width in pixels' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StartPixelTestDto.prototype, "screenWidth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Logical screen height in pixels' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StartPixelTestDto.prototype, "screenHeight", void 0);
class DeadPixelLocationDto {
}
exports.DeadPixelLocationDto = DeadPixelLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'X coordinate (0-based from left)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DeadPixelLocationDto.prototype, "x", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Y coordinate (0-based from top)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DeadPixelLocationDto.prototype, "y", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hex color active when defect was found; omitted for common defects' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeadPixelLocationDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['dead', 'stuck', 'hot'] }),
    (0, class_validator_1.IsEnum)(['dead', 'stuck', 'hot']),
    __metadata("design:type", String)
], DeadPixelLocationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '"All screens" for common defects, color name otherwise' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeadPixelLocationDto.prototype, "detectedDuringColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'True = defect is visible across every test colour' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DeadPixelLocationDto.prototype, "isCommon", void 0);
class ReportDeadPixelsDto {
}
exports.ReportDeadPixelsDto = ReportDeadPixelsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DeadPixelLocationDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DeadPixelLocationDto),
    __metadata("design:type", Array)
], ReportDeadPixelsDto.prototype, "pixels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Index of the current color step' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReportDeadPixelsDto.prototype, "currentColorIndex", void 0);
class CompletePixelTestDto {
}
exports.CompletePixelTestDto = CompletePixelTestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional tester notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompletePixelTestDto.prototype, "notes", void 0);
class UpdateColorIndexDto {
}
exports.UpdateColorIndexDto = UpdateColorIndexDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Index of the color currently being shown' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateColorIndexDto.prototype, "currentColorIndex", void 0);
//# sourceMappingURL=pixel-test.dto.js.map