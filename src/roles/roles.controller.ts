import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get()
    @Permissions('roles:ver')
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @Permissions('roles:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOne(id);
    }

    @Post()
    @Permissions('roles:crear')
    create(@Body() dto: CreateRoleDto) {
        return this.rolesService.create(dto);
    }

    @Patch(':id')
    @Permissions('roles:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRoleDto,
    ) {
        return this.rolesService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('roles:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.remove(id);
    }
}
