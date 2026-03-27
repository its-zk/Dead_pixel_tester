export interface ColorGamut {
  srgb: boolean;
  p3: boolean;
  rec2020: boolean;
}

export interface DisplayCapabilities {
  hdr: boolean;
  colorGamut: ColorGamut;
  colorDepth: number;
  touchSupport: boolean;
  orientationSupport: boolean;
}

export interface DisplayResolution {
  logicalWidth: number;
  logicalHeight: number;
  physicalWidth: number;
  physicalHeight: number;
  devicePixelRatio: number;
}

export interface DisplayInfo {
  id: string;
  sessionId: string;
  userAgent: string;
  resolution: DisplayResolution;
  availableResolution: { width: number; height: number };
  colorDepth: number;
  pixelDepth: number;
  orientation: string;
  refreshRate: number | null;
  capabilities: DisplayCapabilities;
  detectedAt: Date;
}
