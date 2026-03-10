import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWorkerDto, UpdateWorkerDto } from './dto/worker.dto';

@Injectable()
export class WorkersService {
    constructor(private prisma: PrismaService) { }

    create(data: CreateWorkerDto) {
        return this.prisma.worker.create({
            data: {
                ...data,
                dailyRate: Number(data.dailyRate),
            },
        });
    }

    findAll() {
        return this.prisma.worker.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
        });
    }

    findOne(id: number) {
        return this.prisma.worker.findUnique({
            where: { id },
        });
    }

    update(id: number, data: UpdateWorkerDto) {
        return this.prisma.worker.update({
            where: { id },
            data: {
                ...data,
                dailyRate: data.dailyRate ? Number(data.dailyRate) : undefined,
            },
        });
    }

    remove(id: number) {
        return this.prisma.worker.update({
            where: { id },
            data: { active: false },
        });
    }
}
