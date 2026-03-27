import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartPixelTestDto {
  @ApiProperty({ description: 'Session ID linking to display info' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'ID of the display info record' })
  @IsString()
  displayInfoId: string;

  @ApiProperty({ description: 'Logical screen width in pixels' })
  @IsNumber()
  screenWidth: number;

  @ApiProperty({ description: 'Logical screen height in pixels' })
  @IsNumber()
  screenHeight: number;
}

export class DeadPixelLocationDto {
  @ApiProperty({ description: 'X coordinate (0-based from left)' })
  @IsNumber() @Min(0)
  x: number;

  @ApiProperty({ description: 'Y coordinate (0-based from top)' })
  @IsNumber() @Min(0)
  y: number;

  @ApiPropertyOptional({ description: 'Hex color active when defect was found; omitted for common defects' })
  @IsOptional() @IsString()
  color?: string;

  @ApiProperty({ enum: ['dead', 'stuck', 'hot'] })
  @IsEnum(['dead', 'stuck', 'hot'])
  type: 'dead' | 'stuck' | 'hot';

  @ApiProperty({ description: '"All screens" for common defects, color name otherwise' })
  @IsString()
  detectedDuringColor: string;

  @ApiProperty({ description: 'True = defect is visible across every test colour' })
  @IsBoolean()
  isCommon: boolean;
}

export class ReportDeadPixelsDto {
  @ApiProperty({ type: [DeadPixelLocationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeadPixelLocationDto)
  pixels: DeadPixelLocationDto[];

  @ApiProperty({ description: 'Index of the current color step' })
  @IsNumber() @Min(0)
  currentColorIndex: number;
}

export class CompletePixelTestDto {
  @ApiPropertyOptional({ description: 'Optional tester notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateColorIndexDto {
  @ApiProperty({ description: 'Index of the color currently being shown' })
  @IsNumber() @Min(0)
  currentColorIndex: number;
}
