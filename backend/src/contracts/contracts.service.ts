import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) { }

  async create(data: {
    title: string;
    description?: string;
    projectId?: number;
    customerId?: number;
    fileUrl: string;
    fileType?: string;
  }) {
    return this.prisma.contract.create({
      data: {
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        projectId: data.projectId ? Number(data.projectId) : undefined,
        customerId: data.customerId ? Number(data.customerId) : undefined,
      }
    });
  }

  async findAll() {
    return this.prisma.contract.findMany({
      include: {
        project: true,
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async findOne(id: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { project: true, customer: true }
    });
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }
    return contract;
  }

  async update(id: number, updateContractDto: any) {
    return this.prisma.contract.update({
      where: { id },
      data: updateContractDto,
    });
  }

  async remove(id: number) {
    return this.prisma.contract.delete({
      where: { id },
    });
  }
}
