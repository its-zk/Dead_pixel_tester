"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let DisplayService = class DisplayService {
    constructor() {
        this.store = new Map();
    }
    save(dto) {
        const record = {
            id: (0, uuid_1.v4)(),
            ...dto,
            detectedAt: new Date(),
        };
        this.store.set(record.id, record);
        return record;
    }
    findById(id) {
        const record = this.store.get(id);
        if (!record)
            throw new common_1.NotFoundException(`Display info ${id} not found`);
        return record;
    }
    findBySession(sessionId) {
        return [...this.store.values()].filter((r) => r.sessionId === sessionId);
    }
    findAll() {
        return [...this.store.values()];
    }
    delete(id) {
        if (!this.store.has(id))
            throw new common_1.NotFoundException(`Display info ${id} not found`);
        this.store.delete(id);
    }
};
exports.DisplayService = DisplayService;
exports.DisplayService = DisplayService = __decorate([
    (0, common_1.Injectable)()
], DisplayService);
//# sourceMappingURL=display.service.js.map