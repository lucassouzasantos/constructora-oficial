import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectBudgetsService } from './project-budgets.service';
import { CreateProjectBudgetDto } from './dto/create-project-budget.dto';
import { UpdateProjectBudgetDto } from './dto/update-project-budget.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('project-budgets')
export class ProjectBudgetsController {
  constructor(private readonly projectBudgetsService: ProjectBudgetsService) { }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'USER')
  create(@Body() createProjectBudgetDto: CreateProjectBudgetDto) {
    return this.projectBudgetsService.create(createProjectBudgetDto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.projectBudgetsService.findAll(projectId ? +projectId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectBudgetsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'USER')
  update(@Param('id') id: string, @Body() updateProjectBudgetDto: UpdateProjectBudgetDto) {
    return this.projectBudgetsService.update(+id, updateProjectBudgetDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.projectBudgetsService.remove(+id);
  }
}
