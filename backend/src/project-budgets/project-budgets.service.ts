import { Injectable } from '@nestjs/common';
import { CreateProjectBudgetDto } from './dto/create-project-budget.dto';
import { UpdateProjectBudgetDto } from './dto/update-project-budget.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProjectBudgetsService {
  constructor(private prisma: PrismaService) { }

  async create(createProjectBudgetDto: CreateProjectBudgetDto) {
    console.log('Creating budget payload:', createProjectBudgetDto);

    const amount = typeof createProjectBudgetDto.amount === 'string'
      ? Number(createProjectBudgetDto.amount.replace(/\./g, '').replace(/,/g, '.'))
      : Number(createProjectBudgetDto.amount);

    console.log('Parsed amount:', amount);

    try {
      return await this.prisma.projectBudget.create({
        data: {
          category: createProjectBudgetDto.category,
          amount: amount,
          description: createProjectBudgetDto.description,
          projectId: Number(createProjectBudgetDto.projectId),
        },
      });
    } catch (error) {
      console.error('Error creating project budget:', error);
      throw error;
    }
  }

  findAll(projectId?: number) {
    if (projectId) {
      return this.prisma.projectBudget.findMany({
        where: { projectId: Number(projectId) },
      });
    }
    return this.prisma.projectBudget.findMany();
  }

  findOne(id: number) {
    return this.prisma.projectBudget.findUnique({ where: { id } });
  }

  update(id: number, updateProjectBudgetDto: UpdateProjectBudgetDto) {
    return this.prisma.projectBudget.update({
      where: { id },
      data: {
        category: updateProjectBudgetDto.category,
        amount: updateProjectBudgetDto.amount ? Number(updateProjectBudgetDto.amount) : undefined,
        description: updateProjectBudgetDto.description,
      },
    });
  }

  remove(id: number) {
    return this.prisma.projectBudget.delete({ where: { id } });
  }
}
