import { CreateDisplayInfoDto } from './dto/display-info.dto';
import { DisplayInfo } from './interfaces/display-info.interface';
export declare class DisplayService {
    private readonly store;
    save(dto: CreateDisplayInfoDto): DisplayInfo;
    findById(id: string): DisplayInfo;
    findBySession(sessionId: string): DisplayInfo[];
    findAll(): DisplayInfo[];
    delete(id: string): void;
}
