import { DisplayService } from './display.service';
import { CreateDisplayInfoDto } from './dto/display-info.dto';
export declare class DisplayController {
    private readonly displayService;
    constructor(displayService: DisplayService);
    create(dto: CreateDisplayInfoDto): import("./interfaces/display-info.interface").DisplayInfo;
    findAll(sessionId?: string): import("./interfaces/display-info.interface").DisplayInfo[];
    findOne(id: string): import("./interfaces/display-info.interface").DisplayInfo;
    remove(id: string): void;
}
