import { IsNumber, IsString, IsBoolean, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ColorGamutDto {
  @ApiProperty() @IsBoolean() srgb: boolean;
  @ApiProperty() @IsBoolean() p3: boolean;
  @ApiProperty() @IsBoolean() rec2020: boolean;
}

export class DisplayCapabilitiesDto {
  @ApiProperty() @IsBoolean() hdr: boolean;
  @ApiProperty({ type: ColorGamutDto }) @ValidateNested() @Type(() => ColorGamutDto) colorGamut: ColorGamutDto;
  @ApiProperty() @IsNumber() colorDepth: number;
  @ApiProperty() @IsBoolean() touchSupport: boolean;
  @ApiProperty() @IsBoolean() orientationSupport: boolean;
}

export class DisplayResolutionDto {
  @ApiProperty() @IsNumber() logicalWidth: number;
  @ApiProperty() @IsNumber() logicalHeight: number;
  @ApiProperty() @IsNumber() physicalWidth: number;
  @ApiProperty() @IsNumber() physicalHeight: number;
  @ApiProperty() @IsNumber() devicePixelRatio: number;
}

export class AvailableResolutionDto {
  @ApiProperty() @IsNumber() width: number;
  @ApiProperty() @IsNumber() height: number;
}

export class CreateDisplayInfoDto {
  @ApiProperty() @IsString() sessionId: string;
  @ApiProperty() @IsString() userAgent: string;
  @ApiProperty({ type: DisplayResolutionDto }) @ValidateNested() @Type(() => DisplayResolutionDto) resolution: DisplayResolutionDto;
  @ApiProperty({ type: AvailableResolutionDto }) @ValidateNested() @Type(() => AvailableResolutionDto) availableResolution: AvailableResolutionDto;
  @ApiProperty() @IsNumber() colorDepth: number;
  @ApiProperty() @IsNumber() pixelDepth: number;
  @ApiProperty() @IsString() orientation: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() refreshRate: number | null;
  @ApiProperty({ type: DisplayCapabilitiesDto }) @ValidateNested() @Type(() => DisplayCapabilitiesDto) capabilities: DisplayCapabilitiesDto;
}
