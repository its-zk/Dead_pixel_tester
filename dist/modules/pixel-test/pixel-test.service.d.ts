import { PixelTestSession, PixelTestSummary } from './interfaces/pixel-test.interface';
import { StartPixelTestDto, ReportDeadPixelsDto, CompletePixelTestDto, UpdateColorIndexDto } from './dto/pixel-test.dto';
export declare class PixelTestService {
    private readonly store;
    start(dto: StartPixelTestDto): PixelTestSession;
    reportPixels(testId: string, dto: ReportDeadPixelsDto): PixelTestSession;
    advanceColor(testId: string, dto: UpdateColorIndexDto): PixelTestSession;
    complete(testId: string, dto: CompletePixelTestDto): PixelTestSession;
    abandon(testId: string): PixelTestSession;
    getSummary(testId: string): PixelTestSummary;
    findById(testId: string): PixelTestSession;
    findBySession(sessionId: string): PixelTestSession[];
    findAll(): PixelTestSession[];
    getTestColors(): {
        name: string;
        hex: string;
        rgb: number[];
    }[];
    private getOrThrow;
}
