import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Get()
    @Permissions('pagos:ver')
    findAll() {
        return this.paymentsService.findAll();
    }

    @Get(':id')
    @Permissions('pagos:ver')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.paymentsService.findOne(id);
    }

    @Post()
    @Permissions('pagos:crear')
    create(@Body() dto: CreatePaymentDto) {
        return this.paymentsService.create(dto);
    }

    @Post('stripe/create-checkout-session')
    createStripeCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
        return this.paymentsService.createStripeCheckoutSession(dto);
    }

    @Patch(':id')
    @Permissions('pagos:editar')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePaymentDto,
    ) {
        return this.paymentsService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('pagos:eliminar')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.paymentsService.remove(id);
    }

    @Patch(':id/confirmar')
    @Permissions('pagos:confirmar')
    confirmar(@Param('id', ParseIntPipe) id: number) {
        return this.paymentsService.confirmar(id);
    }
}
