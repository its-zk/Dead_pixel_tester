export declare const appConfig: {
    port: number;
    nodeEnv: string;
};
export declare const DEAD_PIXEL_TEST_COLORS: {
    name: string;
    hex: string;
    rgb: number[];
}[];
export declare const TEST_PATTERNS: readonly ["solid-color", "gradient-horizontal", "gradient-vertical", "checkerboard", "crosshatch"];
export type TestPattern = typeof TEST_PATTERNS[number];
