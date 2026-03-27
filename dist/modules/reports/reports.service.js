"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const display_service_1 = require("../display/display.service");
const pixel_test_service_1 = require("../pixel-test/pixel-test.service");
let ReportsService = class ReportsService {
    constructor(displayService, pixelTestService) {
        this.displayService = displayService;
        this.pixelTestService = pixelTestService;
        this.store = new Map();
    }
    generate(dto) {
        const displayInfo = this.displayService.findById(dto.displayInfoId);
        const pixelTest = this.pixelTestService.findById(dto.pixelTestId);
        const summary = this.pixelTestService.getSummary(dto.pixelTestId);
        const totalDefects = summary.totalDeadPixels + summary.totalStuckPixels + summary.totalHotPixels;
        let verdict;
        let verdictReason;
        if (pixelTest.status !== 'completed') {
            verdict = 'INCOMPLETE';
            verdictReason = `Test status is "${pixelTest.status}" — all colors must be tested before a verdict can be given.`;
        }
        else if (totalDefects === 0) {
            verdict = 'PASS';
            verdictReason = 'No dead, stuck, or hot pixels detected across all test colors.';
        }
        else {
            verdict = 'FAIL';
            verdictReason = `${totalDefects} pixel defect(s) found: ${summary.totalDeadPixels} dead, ${summary.totalStuckPixels} stuck, ${summary.totalHotPixels} hot.`;
        }
        const report = {
            id: (0, uuid_1.v4)(),
            generatedAt: new Date(),
            displayInfo,
            pixelTest,
            summary,
            verdict,
            verdictReason,
        };
        this.store.set(report.id, report);
        return report;
    }
    findById(id) {
        const report = this.store.get(id);
        if (!report)
            throw new common_1.NotFoundException(`Report ${id} not found`);
        return report;
    }
    findAll() {
        return [...this.store.values()];
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [display_service_1.DisplayService,
        pixel_test_service_1.PixelTestService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map