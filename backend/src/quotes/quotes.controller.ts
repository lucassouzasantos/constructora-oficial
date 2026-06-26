import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) { }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'USER')
  create(@Request() req, @Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(createQuoteDto, req.user.tenantId);
  }

  @Get()
  findAll(@Request() req) {
    return this.quotesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'USER')
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quotesService.update(+id, updateQuoteDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(+id);
  }

  @Post(':id/duplicate')
  @Roles('ADMIN', 'MANAGER', 'USER')
  duplicate(@Request() req, @Param('id') id: string) {
    return this.quotesService.duplicate(+id, req.user.tenantId);
  }

  @Post(':id/convert')
  @Roles('ADMIN', 'MANAGER', 'USER')
  convertToProject(@Request() req, @Param('id') id: string) {
    return this.quotesService.convertToProject(+id, req.user.tenantId);
  }
}
