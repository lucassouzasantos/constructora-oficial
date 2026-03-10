import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectBudgetsService } from './project-budgets.service';
import { CreateProjectBudgetDto } from './dto/create-project-budget.dto';
import { UpdateProjectBudgetDto } from './dto/update-project-budget.dto';

@Controller('project-budgets')
export class ProjectBudgetsController {
  constructor(private readonly projectBudgetsService: ProjectBudgetsService) { }

  @Post()
  create(@Body() createProjectBudgetDto: CreateProjectBudgetDto) {
    console.log('Controller received create request', createProjectBudgetDto);
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
  update(@Param('id') id: string, @Body() updateProjectBudgetDto: UpdateProjectBudgetDto) {
    return this.projectBudgetsService.update(+id, updateProjectBudgetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectBudgetsService.remove(+id);
  }
}
