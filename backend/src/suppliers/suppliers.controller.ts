import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'USER')
  create(@Request() req, @Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto, req.user.tenantId);
  }

  @Get()
  findAll(@Request() req) {
    return this.suppliersService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'USER')
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(+id);
  }
}
