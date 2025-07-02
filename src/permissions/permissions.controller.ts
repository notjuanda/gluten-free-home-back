import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @Get()
    @Permissions('permisos:ver')
    findAll() {
        return this.permissionsService.findAll();
    }

    @Get(':id')
    @Permissions('permisos:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.permissionsService.findOne(id);
    }

    @Post()
    @Permissions('permisos:crear')
    create(@Body() dto: CreatePermissionDto) {
        return this.permissionsService.create(dto);
    }

    @Put(':id')
    @Permissions('permisos:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePermissionDto,
    ) {
        return this.permissionsService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('permisos:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.permissionsService.remove(id);
    }
}
