import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@Roles('ADMIN')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll(@Request() req) {
        return this.usersService.findAll(req.user.tenantId);
    }

    @Post()
    create(@Request() req, @Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto, req.user.tenantId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
