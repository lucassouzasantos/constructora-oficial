import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { WorkLogsService } from './work-logs.service';
import { CreateWorkLogDto } from './dto/work-log.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('work-logs')
export class WorkLogsController {
    constructor(private readonly workLogsService: WorkLogsService) { }

    @Post()
    @Roles('ADMIN', 'MANAGER', 'USER')
    create(@Body() createWorkLogDto: CreateWorkLogDto) {
        return this.workLogsService.create(createWorkLogDto);
    }

    @Get()
    findByProject(@Query('projectId') projectId: string) {
        return this.workLogsService.findByProject(+projectId);
    }

    @Get('cost')
    getCost(@Query('projectId') projectId: string) {
        if (!projectId) return { cost: 0 };
        return this.workLogsService.getProjectLaborCost(+projectId).then(cost => ({ cost }));
    }

    @Delete(':id')
    @Roles('ADMIN', 'MANAGER')
    remove(@Param('id') id: string) {
        return this.workLogsService.remove(+id);
    }
}
