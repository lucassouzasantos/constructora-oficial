import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ProjectStagesService } from './project-stages.service';
import { CreateProjectStageDto } from './dto/create-project-stage.dto';
import { UpdateProjectStageDto } from './dto/update-project-stage.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('project-stages')
export class ProjectStagesController {
  constructor(private readonly projectStagesService: ProjectStagesService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'USER')
  create(@Body() createProjectStageDto: CreateProjectStageDto) {
    return this.projectStagesService.create(createProjectStageDto);
  }

  @Get()
  findAll(@Query('projectId') projectId: string) {
    if (!projectId) throw new BadRequestException('projectId é obrigatório');
    return this.projectStagesService.findAll(Number(projectId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectStagesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'USER')
  update(@Param('id') id: string, @Body() updateProjectStageDto: UpdateProjectStageDto) {
    return this.projectStagesService.update(+id, updateProjectStageDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.projectStagesService.remove(+id);
  }
}
