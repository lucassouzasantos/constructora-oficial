import { Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) { }

  create(createInventoryDto: CreateInventoryDto) {
    const quantity = typeof createInventoryDto.quantity === 'string'
      ? Number(createInventoryDto.quantity.replace(/\./g, '').replace(/,/g, '.'))
      : Number(createInventoryDto.quantity);

    let minQuantity: number | undefined = undefined;
    if (createInventoryDto.minQuantity !== undefined) {
      minQuantity = typeof createInventoryDto.minQuantity === 'string'
        ? Number(createInventoryDto.minQuantity.replace(/\./g, '').replace(/,/g, '.'))
        : Number(createInventoryDto.minQuantity);
    }

    let unitValue: number = 0;
    if (createInventoryDto.unitValue !== undefined) {
      unitValue = typeof createInventoryDto.unitValue === 'string'
        ? Number(createInventoryDto.unitValue.replace(/\./g, '').replace(/,/g, '.'))
        : Number(createInventoryDto.unitValue);
    }

    return this.prisma.inventoryItem.create({
      data: {
        name: createInventoryDto.name,
        description: createInventoryDto.description,
        quantity: quantity,
        unit: createInventoryDto.unit,
        minQuantity: minQuantity,
        unitValue: unitValue,
        projectId: createInventoryDto.projectId ? Number(createInventoryDto.projectId) : undefined,
      },
      include: {
        project: true,
      }
    });
  }

  findAll() {
    return this.prisma.inventoryItem.findMany({
      include: {
        project: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  findOne(id: number) {
    return this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { project: true }
    });
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    let quantity: number | undefined = undefined;
    if (updateInventoryDto.quantity !== undefined) {
      quantity = typeof updateInventoryDto.quantity === 'string'
        ? Number(updateInventoryDto.quantity.replace(/\./g, '').replace(/,/g, '.'))
        : Number(updateInventoryDto.quantity);
    }

    let minQuantity: number | undefined = undefined;
    if (updateInventoryDto.minQuantity !== undefined) {
      minQuantity = typeof updateInventoryDto.minQuantity === 'string'
        ? Number(updateInventoryDto.minQuantity.replace(/\./g, '').replace(/,/g, '.'))
        : Number(updateInventoryDto.minQuantity);
    }

    let unitValue: number | undefined = undefined;
    if (updateInventoryDto.unitValue !== undefined) {
      unitValue = typeof updateInventoryDto.unitValue === 'string'
        ? Number(updateInventoryDto.unitValue.replace(/\./g, '').replace(/,/g, '.'))
        : Number(updateInventoryDto.unitValue);
    }

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        name: updateInventoryDto.name,
        description: updateInventoryDto.description,
        quantity: quantity,
        unit: updateInventoryDto.unit,
        minQuantity: minQuantity,
        unitValue: unitValue,
        projectId: updateInventoryDto.projectId ? Number(updateInventoryDto.projectId) : undefined,
      },
      include: { project: true }
    });
  }

  remove(id: number) {
    return this.prisma.inventoryItem.delete({
      where: { id }
    });
  }
}
