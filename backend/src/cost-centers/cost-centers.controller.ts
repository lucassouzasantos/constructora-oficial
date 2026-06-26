import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'USER')
  create(@Request() req, @Body() createCostCenterDto: CreateCostCenterDto) {
    return this.costCentersService.create(createCostCenterDto, req.user.tenantId);
  }

  @Get()
  findAll(@Request() req) {
    return this.costCentersService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costCentersService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'USER')
  update(@Param('id') id: string, @Body() updateCostCenterDto: UpdateCostCenterDto) {
    return this.costCentersService.update(+id, updateCostCenterDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.costCentersService.remove(+id);
  }
}
