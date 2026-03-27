import { PixelTestService } from './pixel-test.service';
import { StartPixelTestDto, ReportDeadPixelsDto, CompletePixelTestDto, UpdateColorIndexDto } from './dto/pixel-test.dto';
export declare class PixelTestController {
    private readonly pixelTestService;
    constructor(pixelTestService: PixelTestService);
    getTestColors(): {
        name: string;
        hex: string;
        rgb: number[];
    }[];
    start(dto: StartPixelTestDto): import("./interfaces/pixel-test.interface").PixelTestSession;
    findAll(sessionId?: string): import("./interfaces/pixel-test.interface").PixelTestSession[];
    findOne(id: string): import("./interfaces/pixel-test.interface").PixelTestSession;
    summary(id: string): import("./interfaces/pixel-test.interface").PixelTestSummary;
    reportPixels(id: string, dto: ReportDeadPixelsDto): import("./interfaces/pixel-test.interface").PixelTestSession;
    advanceColor(id: string, dto: UpdateColorIndexDto): import("./interfaces/pixel-test.interface").PixelTestSession;
    complete(id: string, dto: CompletePixelTestDto): import("./interfaces/pixel-test.interface").PixelTestSession;
    abandon(id: string): import("./interfaces/pixel-test.interface").PixelTestSession;
}
