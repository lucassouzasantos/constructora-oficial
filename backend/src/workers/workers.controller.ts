import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto, UpdateWorkerDto } from './dto/worker.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('workers')
export class WorkersController {
    constructor(private readonly workersService: WorkersService) { }

    @Post()
    @Roles('ADMIN', 'MANAGER', 'USER')
    create(@Body() createWorkerDto: CreateWorkerDto) {
        return this.workersService.create(createWorkerDto);
    }

    @Get()
    findAll() {
        return this.workersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.workersService.findOne(+id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'MANAGER', 'USER')
    update(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto) {
        return this.workersService.update(+id, updateWorkerDto);
    }

    @Delete(':id')
    @Roles('ADMIN', 'MANAGER')
    remove(@Param('id') id: string) {
        return this.workersService.remove(+id);
    }
}
