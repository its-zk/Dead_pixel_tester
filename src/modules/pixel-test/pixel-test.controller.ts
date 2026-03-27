import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PixelTestService } from './pixel-test.service';
import {
  StartPixelTestDto,
  ReportDeadPixelsDto,
  CompletePixelTestDto,
  UpdateColorIndexDto,
} from './dto/pixel-test.dto';

@ApiTags('pixel-test')
@Controller('pixel-test')
export class PixelTestController {
  constructor(private readonly pixelTestService: PixelTestService) {}

  @Get('colors')
  @ApiOperation({ summary: 'Get the list of test colors used for dead-pixel detection' })
  getTestColors() {
    return this.pixelTestService.getTestColors();
  }

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start a new dead-pixel test session' })
  start(@Body() dto: StartPixelTestDto) {
    return this.pixelTestService.start(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all pixel test sessions' })
  @ApiQuery({ name: 'sessionId', required: false })
  findAll(@Query('sessionId') sessionId?: string) {
    if (sessionId) return this.pixelTestService.findBySession(sessionId);
    return this.pixelTestService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pixel test session' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.pixelTestService.findById(id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get test summary and defect counts' })
  @ApiParam({ name: 'id' })
  summary(@Param('id') id: string) {
    return this.pixelTestService.getSummary(id);
  }

  @Patch(':id/pixels')
  @ApiOperation({ summary: 'Report dead/stuck/hot pixels found during a color step' })
  @ApiParam({ name: 'id' })
  reportPixels(@Param('id') id: string, @Body() dto: ReportDeadPixelsDto) {
    return this.pixelTestService.reportPixels(id, dto);
  }

  @Patch(':id/color')
  @ApiOperation({ summary: 'Advance to the next color index' })
  @ApiParam({ name: 'id' })
  advanceColor(@Param('id') id: string, @Body() dto: UpdateColorIndexDto) {
    return this.pixelTestService.advanceColor(id, dto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark the test as completed' })
  @ApiParam({ name: 'id' })
  complete(@Param('id') id: string, @Body() dto: CompletePixelTestDto) {
    return this.pixelTestService.complete(id, dto);
  }

  @Patch(':id/abandon')
  @ApiOperation({ summary: 'Abandon the test session' })
  @ApiParam({ name: 'id' })
  abandon(@Param('id') id: string) {
    return this.pixelTestService.abandon(id);
  }
}
