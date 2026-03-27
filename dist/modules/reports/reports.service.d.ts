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
export declare class ReportsService {
    private readonly displayService;
    private readonly pixelTestService;
    private readonly store;
    constructor(displayService: DisplayService, pixelTestService: PixelTestService);
    generate(dto: GenerateReportDto): Report;
    findById(id: string): Report;
    findAll(): Report[];
}
