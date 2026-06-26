import { Injectable, ConflictException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  create(createCustomerDto: CreateCustomerDto, tenantId: number) {
    return this.prisma.customer.create({
      data: { ...createCustomerDto, tenantId },
    });
  }

  findAll(tenantId: number) {
    return this.prisma.customer.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data: updateCustomerDto });
  }

  async remove(id: number) {
    try {
      return await this.prisma.customer.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new ConflictException('Não é possível excluir cliente com transações vinculadas.');
      }
      throw error;
    }
  }
}
