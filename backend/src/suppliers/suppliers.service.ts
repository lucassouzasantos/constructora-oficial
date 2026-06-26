import { Injectable, ConflictException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) { }

  create(createSupplierDto: CreateSupplierDto, tenantId: number) {
    return this.prisma.supplier.create({
      data: { ...createSupplierDto, tenantId },
    });
  }

  findAll(tenantId: number) {
    return this.prisma.supplier.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.supplier.findUnique({ where: { id } });
  }

  update(id: number, updateSupplierDto: UpdateSupplierDto) {
    return this.prisma.supplier.update({ where: { id }, data: updateSupplierDto });
  }

  async remove(id: number) {
    try {
      return await this.prisma.supplier.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new ConflictException('Não é possível excluir fornecedor com transações vinculadas.');
      }
      throw error;
    }
  }
}
