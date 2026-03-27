import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateDisplayInfoDto } from './dto/display-info.dto';
import { DisplayInfo } from './interfaces/display-info.interface';

@Injectable()
export class DisplayService {
  // In-memory store (swap for TypeORM/Prisma for persistence)
  private readonly store = new Map<string, DisplayInfo>();

  save(dto: CreateDisplayInfoDto): DisplayInfo {
    const record: DisplayInfo = {
      id: uuidv4(),
      ...dto,
      detectedAt: new Date(),
    };
    this.store.set(record.id, record);
    return record;
  }

  findById(id: string): DisplayInfo {
    const record = this.store.get(id);
    if (!record) throw new NotFoundException(`Display info ${id} not found`);
    return record;
  }

  findBySession(sessionId: string): DisplayInfo[] {
    return [...this.store.values()].filter((r) => r.sessionId === sessionId);
  }

  findAll(): DisplayInfo[] {
    return [...this.store.values()];
  }

  delete(id: string): void {
    if (!this.store.has(id)) throw new NotFoundException(`Display info ${id} not found`);
    this.store.delete(id);
  }
}
