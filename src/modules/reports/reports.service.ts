import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DisplayService } from '../display/display.service';
import { PixelTestService } from '../pixel-test/pixel-test.service';
import { GenerateReportDto } from './dto/report.dto';

export interface Report {
  id: string;
  generatedAt: Date;
  displayInfo: any;
  pixelTest: any;
  summary: any;
  verdict: 'PASS' | 'FAIL' | 'INCOMPLETE';
  verdictReason: string;
}

@Injectable()
export class ReportsService {
  private readonly store = new Map<string, Report>();

  constructor(
    private readonly displayService: DisplayService,
    private readonly pixelTestService: PixelTestService,
  ) {}

  generate(dto: GenerateReportDto): Report {
    const displayInfo = this.displayService.findById(dto.displayInfoId);
    const pixelTest = this.pixelTestService.findById(dto.pixelTestId);
    const summary = this.pixelTestService.getSummary(dto.pixelTestId);

    const totalDefects =
      summary.totalDeadPixels + summary.totalStuckPixels + summary.totalHotPixels;

    let verdict: 'PASS' | 'FAIL' | 'INCOMPLETE';
    let verdictReason: string;

    if (pixelTest.status !== 'completed') {
      verdict = 'INCOMPLETE';
      verdictReason = `Test status is "${pixelTest.status}" — all colors must be tested before a verdict can be given.`;
    } else if (totalDefects === 0) {
      verdict = 'PASS';
      verdictReason = 'No dead, stuck, or hot pixels detected across all test colors.';
    } else {
      verdict = 'FAIL';
      verdictReason = `${totalDefects} pixel defect(s) found: ${summary.totalDeadPixels} dead, ${summary.totalStuckPixels} stuck, ${summary.totalHotPixels} hot.`;
    }

    const report: Report = {
      id: uuidv4(),
      generatedAt: new Date(),
      displayInfo,
      pixelTest,
      summary,
      verdict,
      verdictReason,
    };

    this.store.set(report.id, report);
    return report;
  }

  findById(id: string): Report {
    const report = this.store.get(id);
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    return report;
  }

  findAll(): Report[] {
    return [...this.store.values()];
  }
}
