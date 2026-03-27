export type TestStatus = 'pending' | 'in-progress' | 'completed' | 'abandoned';
export interface DeadPixelLocation {
    x: number;
    y: number;
    color?: string;
    type: 'dead' | 'stuck' | 'hot';
    detectedDuringColor: string;
    isCommon: boolean;
}
export interface PixelTestSession {
    id: string;
    displayInfoId: string;
    sessionId: string;
    status: TestStatus;
    colorsToTest: string[];
    currentColorIndex: number;
    reportedDeadPixels: DeadPixelLocation[];
    startedAt: Date;
    completedAt: Date | null;
    durationMs: number | null;
    screenWidth: number;
    screenHeight: number;
    notes: string;
}
export interface PixelTestSummary {
    totalDeadPixels: number;
    totalStuckPixels: number;
    totalHotPixels: number;
    colorsTestedCount: number;
    passedAllColors: boolean;
}
