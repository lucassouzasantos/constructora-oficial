import { Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from '../prisma.service';

const parseDecimal = (value: any): number =>
  typeof value === 'string'
    ? Number(value.replace(/\./g, '').replace(/,/g, '.'))
    : Number(value);

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) { }

  create(dto: CreateInventoryDto, tenantId: number) {
    const quantity = parseDecimal(dto.quantity);
    const minQuantity = dto.minQuantity !== undefined ? parseDecimal(dto.minQuantity) : undefined;
    const unitValue = dto.unitValue !== undefined ? parseDecimal(dto.unitValue) : 0;

    return this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        quantity,
        unit: dto.unit,
        minQuantity,
        unitValue,
        tenantId,
        projectId: dto.projectId ? Number(dto.projectId) : undefined,
      },
      include: { project: true },
    });
  }

  findAll(tenantId: number) {
    return this.prisma.inventoryItem.findMany({
      where: { tenantId },
      include: { project: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.inventoryItem.findUnique({ where: { id }, include: { project: true } });
  }

  update(id: number, dto: UpdateInventoryDto) {
    const quantity = dto.quantity !== undefined ? parseDecimal(dto.quantity) : undefined;
    const minQuantity = dto.minQuantity !== undefined ? parseDecimal(dto.minQuantity) : undefined;
    const unitValue = dto.unitValue !== undefined ? parseDecimal(dto.unitValue) : undefined;

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        quantity,
        unit: dto.unit,
        minQuantity,
        unitValue,
        projectId: dto.projectId ? Number(dto.projectId) : undefined,
      },
      include: { project: true },
    });
  }

  remove(id: number) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }
}
