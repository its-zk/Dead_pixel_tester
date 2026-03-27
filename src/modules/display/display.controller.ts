import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DisplayService } from './display.service';
import { CreateDisplayInfoDto } from './dto/display-info.dto';

@ApiTags('display')
@Controller('display')
export class DisplayController {
  constructor(private readonly displayService: DisplayService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit detected display info from the client' })
  create(@Body() dto: CreateDisplayInfoDto) {
    return this.displayService.save(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all stored display records' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Filter by session' })
  findAll(@Query('sessionId') sessionId?: string) {
    if (sessionId) return this.displayService.findBySession(sessionId);
    return this.displayService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single display record' })
  @ApiParam({ name: 'id', description: 'Display record UUID' })
  findOne(@Param('id') id: string) {
    return this.displayService.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a display record' })
  @ApiParam({ name: 'id', description: 'Display record UUID' })
  remove(@Param('id') id: string) {
    this.displayService.delete(id);
  }
}
