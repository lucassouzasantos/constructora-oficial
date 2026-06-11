import { Injectable } from '@nestjs/common';
import { CreateProjectStageDto } from './dto/create-project-stage.dto';
import { UpdateProjectStageDto } from './dto/update-project-stage.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProjectStagesService {
  constructor(private prisma: PrismaService) { }

  create(createProjectStageDto: CreateProjectStageDto) {
    return this.prisma.projectStage.create({
      data: {
        name: createProjectStageDto.name,
        startDatePlanned: createProjectStageDto.startDatePlanned ? new Date(createProjectStageDto.startDatePlanned) : undefined,
        endDatePlanned: createProjectStageDto.endDatePlanned ? new Date(createProjectStageDto.endDatePlanned) : undefined,
        startDateReal: createProjectStageDto.startDateReal ? new Date(createProjectStageDto.startDateReal) : undefined,
        endDateReal: createProjectStageDto.endDateReal ? new Date(createProjectStageDto.endDateReal) : undefined,
        status: createProjectStageDto.status || 'PENDING',
        projectId: Number(createProjectStageDto.projectId), // Ensure numeric
      },
    });
  }

  findAll(projectId: number) {
    return this.prisma.projectStage.findMany({
      where: { projectId },
      orderBy: { startDatePlanned: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.projectStage.findUnique({
      where: { id },
    });
  }

  update(id: number, updateProjectStageDto: UpdateProjectStageDto) {
    return this.prisma.projectStage.update({
      where: { id },
      data: {
        name: updateProjectStageDto.name,
        startDatePlanned: updateProjectStageDto.startDatePlanned ? new Date(updateProjectStageDto.startDatePlanned) : undefined,
        endDatePlanned: updateProjectStageDto.endDatePlanned ? new Date(updateProjectStageDto.endDatePlanned) : undefined,
        startDateReal: updateProjectStageDto.startDateReal ? new Date(updateProjectStageDto.startDateReal) : undefined,
        endDateReal: updateProjectStageDto.endDateReal ? new Date(updateProjectStageDto.endDateReal) : undefined,
        status: updateProjectStageDto.status,
      },
    });
  }

  remove(id: number) {
    return this.prisma.projectStage.delete({
      where: { id },
    });
  }
}
