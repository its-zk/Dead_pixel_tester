"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PixelTestService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const app_config_1 = require("../../config/app.config");
let PixelTestService = class PixelTestService {
    constructor() {
        this.store = new Map();
    }
    start(dto) {
        const session = {
            id: (0, uuid_1.v4)(),
            displayInfoId: dto.displayInfoId,
            sessionId: dto.sessionId,
            status: 'in-progress',
            colorsToTest: app_config_1.DEAD_PIXEL_TEST_COLORS.map((c) => c.hex),
            currentColorIndex: 0,
            reportedDeadPixels: [],
            startedAt: new Date(),
            completedAt: null,
            durationMs: null,
            screenWidth: dto.screenWidth,
            screenHeight: dto.screenHeight,
            notes: '',
        };
        this.store.set(session.id, session);
        return session;
    }
    reportPixels(testId, dto) {
        const session = this.getOrThrow(testId);
        if (session.status !== 'in-progress') {
            throw new common_1.BadRequestException(`Test ${testId} is not in-progress`);
        }
        const newPixels = dto.pixels.map((p) => ({ ...p }));
        session.reportedDeadPixels.push(...newPixels);
        session.currentColorIndex = dto.currentColorIndex;
        return session;
    }
    advanceColor(testId, dto) {
        const session = this.getOrThrow(testId);
        if (session.status !== 'in-progress') {
            throw new common_1.BadRequestException(`Test ${testId} is not in-progress`);
        }
        session.currentColorIndex = dto.currentColorIndex;
        return session;
    }
    complete(testId, dto) {
        const session = this.getOrThrow(testId);
        if (session.status !== 'in-progress') {
            throw new common_1.BadRequestException(`Test ${testId} is already ${session.status}`);
        }
        session.status = 'completed';
        session.completedAt = new Date();
        session.durationMs = session.completedAt.getTime() - session.startedAt.getTime();
        session.notes = dto.notes ?? '';
        return session;
    }
    abandon(testId) {
        const session = this.getOrThrow(testId);
        session.status = 'abandoned';
        session.completedAt = new Date();
        return session;
    }
    getSummary(testId) {
        const session = this.getOrThrow(testId);
        const pixels = session.reportedDeadPixels;
        return {
            totalDeadPixels: pixels.filter((p) => p.type === 'dead').length,
            totalStuckPixels: pixels.filter((p) => p.type === 'stuck').length,
            totalHotPixels: pixels.filter((p) => p.type === 'hot').length,
            colorsTestedCount: session.currentColorIndex + 1,
            passedAllColors: pixels.length === 0 &&
                session.status === 'completed',
        };
    }
    findById(testId) {
        return this.getOrThrow(testId);
    }
    findBySession(sessionId) {
        return [...this.store.values()].filter((s) => s.sessionId === sessionId);
    }
    findAll() {
        return [...this.store.values()];
    }
    getTestColors() {
        return app_config_1.DEAD_PIXEL_TEST_COLORS;
    }
    getOrThrow(testId) {
        const session = this.store.get(testId);
        if (!session)
            throw new common_1.NotFoundException(`Pixel test session ${testId} not found`);
        return session;
    }
};
exports.PixelTestService = PixelTestService;
exports.PixelTestService = PixelTestService = __decorate([
    (0, common_1.Injectable)()
], PixelTestService);
//# sourceMappingURL=pixel-test.service.js.map