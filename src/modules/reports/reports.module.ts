import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { DisplayModule } from '../display/display.module';
import { PixelTestModule } from '../pixel-test/pixel-test.module';

@Module({
  imports: [DisplayModule, PixelTestModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
