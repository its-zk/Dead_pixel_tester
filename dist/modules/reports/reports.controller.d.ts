import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generate(dto: GenerateReportDto): import("./reports.service").Report;
    findAll(): import("./reports.service").Report[];
    findOne(id: string): import("./reports.service").Report;
}
