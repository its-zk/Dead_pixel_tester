import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DEAD_PIXEL_TEST_COLORS } from '../../config/app.config';
import {
  PixelTestSession,
  PixelTestSummary,
  DeadPixelLocation,
} from './interfaces/pixel-test.interface';
import {
  StartPixelTestDto,
  ReportDeadPixelsDto,
  CompletePixelTestDto,
  UpdateColorIndexDto,
} from './dto/pixel-test.dto';

@Injectable()
export class PixelTestService {
  private readonly store = new Map<string, PixelTestSession>();

  start(dto: StartPixelTestDto): PixelTestSession {
    const session: PixelTestSession = {
      id: uuidv4(),
      displayInfoId: dto.displayInfoId,
      sessionId: dto.sessionId,
      status: 'in-progress',
      colorsToTest: DEAD_PIXEL_TEST_COLORS.map((c) => c.hex),
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

  reportPixels(testId: string, dto: ReportDeadPixelsDto): PixelTestSession {
    const session = this.getOrThrow(testId);
    if (session.status !== 'in-progress') {
      throw new BadRequestException(`Test ${testId} is not in-progress`);
    }

    const newPixels: DeadPixelLocation[] = dto.pixels.map((p) => ({ ...p }));
    session.reportedDeadPixels.push(...newPixels);
    session.currentColorIndex = dto.currentColorIndex;
    return session;
  }

  advanceColor(testId: string, dto: UpdateColorIndexDto): PixelTestSession {
    const session = this.getOrThrow(testId);
    if (session.status !== 'in-progress') {
      throw new BadRequestException(`Test ${testId} is not in-progress`);
    }
    session.currentColorIndex = dto.currentColorIndex;
    return session;
  }

  complete(testId: string, dto: CompletePixelTestDto): PixelTestSession {
    const session = this.getOrThrow(testId);
    if (session.status !== 'in-progress') {
      throw new BadRequestException(`Test ${testId} is already ${session.status}`);
    }
    session.status = 'completed';
    session.completedAt = new Date();
    session.durationMs = session.completedAt.getTime() - session.startedAt.getTime();
    session.notes = dto.notes ?? '';
    return session;
  }

  abandon(testId: string): PixelTestSession {
    const session = this.getOrThrow(testId);
    session.status = 'abandoned';
    session.completedAt = new Date();
    return session;
  }

  getSummary(testId: string): PixelTestSummary {
    const session = this.getOrThrow(testId);
    const pixels = session.reportedDeadPixels;
    return {
      totalDeadPixels: pixels.filter((p) => p.type === 'dead').length,
      totalStuckPixels: pixels.filter((p) => p.type === 'stuck').length,
      totalHotPixels: pixels.filter((p) => p.type === 'hot').length,
      colorsTestedCount: session.currentColorIndex + 1,
      passedAllColors:
        pixels.length === 0 &&
        session.status === 'completed',
    };
  }

  findById(testId: string): PixelTestSession {
    return this.getOrThrow(testId);
  }

  findBySession(sessionId: string): PixelTestSession[] {
    return [...this.store.values()].filter((s) => s.sessionId === sessionId);
  }

  findAll(): PixelTestSession[] {
    return [...this.store.values()];
  }

  getTestColors() {
    return DEAD_PIXEL_TEST_COLORS;
  }

  private getOrThrow(testId: string): PixelTestSession {
    const session = this.store.get(testId);
    if (!session) throw new NotFoundException(`Pixel test session ${testId} not found`);
    return session;
  }
}
