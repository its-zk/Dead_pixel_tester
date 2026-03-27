export declare class ColorGamutDto {
    srgb: boolean;
    p3: boolean;
    rec2020: boolean;
}
export declare class DisplayCapabilitiesDto {
    hdr: boolean;
    colorGamut: ColorGamutDto;
    colorDepth: number;
    touchSupport: boolean;
    orientationSupport: boolean;
}
export declare class DisplayResolutionDto {
    logicalWidth: number;
    logicalHeight: number;
    physicalWidth: number;
    physicalHeight: number;
    devicePixelRatio: number;
}
export declare class AvailableResolutionDto {
    width: number;
    height: number;
}
export declare class CreateDisplayInfoDto {
    sessionId: string;
    userAgent: string;
    resolution: DisplayResolutionDto;
    availableResolution: AvailableResolutionDto;
    colorDepth: number;
    pixelDepth: number;
    orientation: string;
    refreshRate: number | null;
    capabilities: DisplayCapabilitiesDto;
}
