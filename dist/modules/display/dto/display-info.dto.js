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
exports.CreateDisplayInfoDto = exports.AvailableResolutionDto = exports.DisplayResolutionDto = exports.DisplayCapabilitiesDto = exports.ColorGamutDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ColorGamutDto {
}
exports.ColorGamutDto = ColorGamutDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ColorGamutDto.prototype, "srgb", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ColorGamutDto.prototype, "p3", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ColorGamutDto.prototype, "rec2020", void 0);
class DisplayCapabilitiesDto {
}
exports.DisplayCapabilitiesDto = DisplayCapabilitiesDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DisplayCapabilitiesDto.prototype, "hdr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ColorGamutDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ColorGamutDto),
    __metadata("design:type", ColorGamutDto)
], DisplayCapabilitiesDto.prototype, "colorGamut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DisplayCapabilitiesDto.prototype, "colorDepth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DisplayCapabilitiesDto.prototype, "touchSupport", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DisplayCapabilitiesDto.prototype, "orientationSupport", void 0);
class DisplayResolutionDto {
}
exports.DisplayResolutionDto = DisplayResolutionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DisplayResolutionDto.prototype, "logicalWidth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DisplayResolutionDto.prototype, "logicalHeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DisplayResolutionDto.prototype, "physicalWidth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DisplayResolutionDto.prototype, "physicalHeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DisplayResolutionDto.prototype, "devicePixelRatio", void 0);
class AvailableResolutionDto {
}
exports.AvailableResolutionDto = AvailableResolutionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AvailableResolutionDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AvailableResolutionDto.prototype, "height", void 0);
class CreateDisplayInfoDto {
}
exports.CreateDisplayInfoDto = CreateDisplayInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisplayInfoDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisplayInfoDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: DisplayResolutionDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DisplayResolutionDto),
    __metadata("design:type", DisplayResolutionDto)
], CreateDisplayInfoDto.prototype, "resolution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AvailableResolutionDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AvailableResolutionDto),
    __metadata("design:type", AvailableResolutionDto)
], CreateDisplayInfoDto.prototype, "availableResolution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDisplayInfoDto.prototype, "colorDepth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDisplayInfoDto.prototype, "pixelDepth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDisplayInfoDto.prototype, "orientation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDisplayInfoDto.prototype, "refreshRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: DisplayCapabilitiesDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DisplayCapabilitiesDto),
    __metadata("design:type", DisplayCapabilitiesDto)
], CreateDisplayInfoDto.prototype, "capabilities", void 0);
//# sourceMappingURL=display-info.dto.js.map