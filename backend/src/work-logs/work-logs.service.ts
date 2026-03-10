import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWorkLogDto, UpdateWorkLogDto } from './dto/work-log.dto';

@Injectable()
export class WorkLogsService {
    constructor(private prisma: PrismaService) { }

    create(data: CreateWorkLogDto) {
        return this.prisma.workLog.create({
            data: {
                worker: { connect: { id: Number(data.workerId) } },
                project: { connect: { id: Number(data.projectId) } },
                date: new Date(data.date),
                days: Number(data.days),
                description: data.description,
            },
            include: { worker: true },
        });
    }

    findByProject(projectId: number) {
        return this.prisma.workLog.findMany({
            where: { projectId },
            include: { worker: true },
            orderBy: { date: 'desc' },
        });
    }

    async getProjectLaborCost(projectId: number) {
        const logs = await this.prisma.workLog.findMany({
            where: { projectId },
            include: { worker: true },
        });

        return logs.reduce((total, log) => {
            return total + (Number(log.days) * Number(log.worker.dailyRate));
        }, 0);
    }

    remove(id: number) {
        return this.prisma.workLog.delete({
            where: { id },
        });
    }
}
