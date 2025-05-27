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
    @Permissions('permissions:ver')
    findAll() {
        return this.permissionsService.findAll();
    }

    @Get(':id')
    @Permissions('permissions:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.permissionsService.findOne(id);
    }

    @Post()
    @Permissions('permissions:crear')
    create(@Body() dto: CreatePermissionDto) {
        return this.permissionsService.create(dto);
    }

    @Put(':id')
    @Permissions('permissions:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePermissionDto,
    ) {
        return this.permissionsService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('permissions:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.permissionsService.remove(id);
    }
}
