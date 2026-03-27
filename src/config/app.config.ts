export const appConfig = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

export const DEAD_PIXEL_TEST_COLORS = [
  { name: 'Black',   hex: '#000000', rgb: [0, 0, 0] },
  { name: 'White',   hex: '#FFFFFF', rgb: [255, 255, 255] },
  { name: 'Red',     hex: '#FF0000', rgb: [255, 0, 0] },
  { name: 'Green',   hex: '#00FF00', rgb: [0, 255, 0] },
  { name: 'Blue',    hex: '#0000FF', rgb: [0, 0, 255] },
  { name: 'Cyan',    hex: '#00FFFF', rgb: [0, 255, 255] },
  { name: 'Magenta', hex: '#FF00FF', rgb: [255, 0, 255] },
  { name: 'Yellow',  hex: '#FFFF00', rgb: [255, 255, 0] },
];

export const TEST_PATTERNS = [
  'solid-color',
  'gradient-horizontal',
  'gradient-vertical',
  'checkerboard',
  'crosshatch',
] as const;

export type TestPattern = typeof TEST_PATTERNS[number];
