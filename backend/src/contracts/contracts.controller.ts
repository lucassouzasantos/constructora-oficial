import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Request } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import sanitizeFilename from 'sanitize-filename';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Roles } from '../auth/decorators/roles.decorator';

const ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) { }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'USER')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req: any, file, callback) => {
        const tenantId = req.user?.tenantId || 'default';
        const dir = `./uploads/${tenantId}`;
        mkdirSync(dir, { recursive: true });
        callback(null, dir);
      },
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const safeName = sanitizeFilename(file.originalname.replace(ext, '')).replace(/\s+/g, '-').substring(0, 100);
        callback(null, `${safeName}-${uniqueSuffix}${ext}`);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      if (!ALLOWED_MIMES.includes(file.mimetype)) {
        return callback(new BadRequestException('Tipo de arquivo não permitido. Use PDF, Word ou imagens.'), false);
      }
      callback(null, true);
    }
  }))
  create(
    @Request() req,
    @Body() createContractDto: CreateContractDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Um arquivo é obrigatório para o contrato.');
    }
    return this.contractsService.create({
      ...createContractDto,
      fileUrl: `/uploads/${req.user.tenantId}/${file.filename}`,
      fileType: file.mimetype,
      tenantId: req.user.tenantId,
    });
  }

  @Get()
  findAll(@Request() req) {
    return this.contractsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'USER')
  update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(+id, updateContractDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(+id);
  }
}
