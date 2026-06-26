import { Injectable } from '@nestjs/common';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) { }

  create(createFinanceDto: CreateFinanceDto, tenantId: number) {
    const { dueDate, supplierId, customerId, projectId, costCenterId, category, quantity, unit, ...rest } = createFinanceDto;
    return this.prisma.financialTransaction.create({
      data: {
        ...rest,
        category,
        quantity,
        unit,
        dueDate: new Date(dueDate),
        tenantId,
        supplierId: supplierId ? Number(supplierId) : undefined,
        customerId: customerId ? Number(customerId) : undefined,
        projectId: projectId ? Number(projectId) : undefined,
        costCenterId: costCenterId ? Number(costCenterId) : undefined,
      },
      include: {
        supplier: true,
        customer: true,
        project: true,
      },
    });
  }

  findAll(tenantId: number, projectId?: number) {
    return this.prisma.financialTransaction.findMany({
      where: { tenantId, ...(projectId ? { projectId } : {}) },
      orderBy: { dueDate: 'desc' },
      include: {
        supplier: true,
        customer: true,
        project: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.financialTransaction.findUnique({
      where: { id },
      include: {
        supplier: true,
        customer: true,
        project: true,
      },
    });
  }

  update(id: number, updateFinanceDto: UpdateFinanceDto) {
    const { dueDate, supplierId, customerId, projectId, category, quantity, unit, ...rest } = updateFinanceDto;

    const data: any = { ...rest, category, quantity, unit };

    if (dueDate) data.dueDate = new Date(dueDate);
    if (supplierId !== undefined) data.supplierId = supplierId ? Number(supplierId) : null;
    if (customerId !== undefined) data.customerId = customerId ? Number(customerId) : null;
    if (projectId !== undefined) data.projectId = projectId ? Number(projectId) : null;

    return this.prisma.financialTransaction.update({
      where: { id },
      data,
      include: { supplier: true, customer: true, project: true },
    });
  }

  remove(id: number) {
    return this.prisma.financialTransaction.delete({ where: { id } });
  }
}
