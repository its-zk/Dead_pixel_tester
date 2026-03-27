import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty({ description: 'Pixel test session ID to generate the report from' })
  @IsString()
  pixelTestId: string;

  @ApiProperty({ description: 'Display info record ID' })
  @IsString()
  displayInfoId: string;
}
