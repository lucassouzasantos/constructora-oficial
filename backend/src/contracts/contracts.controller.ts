import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const safeName = require('sanitize-filename')(file.originalname.replace(ext, '')).replace(/\s+/g, '-');
        callback(null, `${safeName}-${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(pdf|doc|docx|jpg|jpeg|png)$/i)) {
        return callback(new BadRequestException('Only PDF, Word, and Images are allowed!'), false);
      }
      callback(null, true);
    }
  }))
  create(
    @Body() createContractDto: CreateContractDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('A file is required for the contract');
    }
    return this.contractsService.create({
      ...createContractDto,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
    });
  }

  @Get()
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(+id, updateContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(+id);
  }
}
