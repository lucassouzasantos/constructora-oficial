import { Injectable, ConflictException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        city: createProjectDto.city,
        location: createProjectDto.location,
        status: createProjectDto.status,
        startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : undefined,
        endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : undefined,
        customerId: createProjectDto.customerId ? Number(createProjectDto.customerId) : null,
        totalArea: createProjectDto.totalArea ? Number(createProjectDto.totalArea) : null,
        salesValue: createProjectDto.salesValue ? Number(createProjectDto.salesValue) : null,
      },
    });
  }

  findAll() {
    return this.prisma.project.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { customer: true },
    });
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: {
        name: updateProjectDto.name,
        city: updateProjectDto.city,
        location: updateProjectDto.location,
        status: updateProjectDto.status,
        startDate: updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : undefined,
        endDate: updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : undefined,
        customerId: updateProjectDto.customerId ? Number(updateProjectDto.customerId) : null,
        totalArea: updateProjectDto.totalArea ? Number(updateProjectDto.totalArea) : null,
        salesValue: updateProjectDto.salesValue ? Number(updateProjectDto.salesValue) : null,
      },
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      // Typically projects don't have constraints yet, but good practice
      throw error;
    }
  }
}
