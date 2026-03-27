import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/report.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a report from a completed pixel test' })
  generate(@Body() dto: GenerateReportDto) {
    return this.reportsService.generate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all generated reports' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific report' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }
}
