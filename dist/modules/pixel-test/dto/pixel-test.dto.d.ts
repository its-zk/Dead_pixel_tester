export declare class StartPixelTestDto {
    sessionId: string;
    displayInfoId: string;
    screenWidth: number;
    screenHeight: number;
}
export declare class DeadPixelLocationDto {
    x: number;
    y: number;
    color?: string;
    type: 'dead' | 'stuck' | 'hot';
    detectedDuringColor: string;
    isCommon: boolean;
}
export declare class ReportDeadPixelsDto {
    pixels: DeadPixelLocationDto[];
    currentColorIndex: number;
}
export declare class CompletePixelTestDto {
    notes?: string;
}
export declare class UpdateColorIndexDto {
    currentColorIndex: number;
}
