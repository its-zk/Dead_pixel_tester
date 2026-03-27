import { Module } from '@nestjs/common';
import { PixelTestController } from './pixel-test.controller';
import { PixelTestService } from './pixel-test.service';

@Module({
  controllers: [PixelTestController],
  providers: [PixelTestService],
  exports: [PixelTestService],
})
export class PixelTestModule {}
