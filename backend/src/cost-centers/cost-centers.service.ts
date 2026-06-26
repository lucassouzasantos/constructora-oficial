import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';

@Injectable()
export class CostCentersService {
  constructor(private prisma: PrismaService) { }

  create(createCostCenterDto: CreateCostCenterDto, tenantId: number) {
    return this.prisma.costCenter.create({
      data: { ...createCostCenterDto, tenantId },
    });
  }

  findAll(tenantId: number) {
    return this.prisma.costCenter.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.costCenter.findUnique({ where: { id } });
  }

  update(id: number, updateCostCenterDto: UpdateCostCenterDto) {
    return this.prisma.costCenter.update({ where: { id }, data: updateCostCenterDto });
  }

  remove(id: number) {
    return this.prisma.costCenter.delete({ where: { id } });
  }
}
