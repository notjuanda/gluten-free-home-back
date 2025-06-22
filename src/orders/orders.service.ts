import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from '../users/entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { MailService } from '../mail/mail.service';
import * as PDFDocument from 'pdfkit';
import * as streamBuffers from 'stream-buffers';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private readonly repo: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly itemRepo: Repository<OrderItem>,
        @InjectRepository(Address)
        private readonly addrRepo: Repository<Address>,
        @InjectRepository(Product)
        private readonly prodRepo: Repository<Product>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
        private readonly mailService: MailService,
    ) {}

    findAll() {
        return this.repo.find({
            relations: ['usuario', 'direccionEnvio', 'items', 'items.producto'],
        });
    }

    async findOne(id: number) {
        const pedido = await this.repo.findOne({
            where: { id },
            relations: ['usuario', 'direccionEnvio', 'items', 'items.producto'],
        });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        return pedido;
    }

    async create(dto: CreateOrderDto) {
        // 1. Validar IDs
        const usuario = await this.userRepo.findOneBy({ id: dto.usuarioId });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');

        const direccion = await this.addrRepo.findOneBy({
            id: dto.direccionEnvioId,
        });
        if (!direccion) throw new NotFoundException('Dirección no encontrada');

        // 2. Crear la orden y sus items
        const newOrder = this.repo.create({
            usuario,
            direccionEnvio: direccion,
            costoEnvioBob: dto.costoEnvioBob,
            costoEnvioUsd: dto.costoEnvioUsd,
            items: [],
        });

        let subtotalBob = 0;

        for (const itemDto of dto.items) {
            const product = await this.prodRepo.findOneBy({
                id: itemDto.productoId,
            });
            if (!product)
                throw new NotFoundException(
                    `Producto con ID ${itemDto.productoId} no encontrado`,
                );

            const orderItem = this.itemRepo.create({
                producto: product,
                cantidad: itemDto.cantidad,
                precioUnitBob: product.precioBob,
                precioUnitUsd: product.precioUsd,
            });
            newOrder.items.push(orderItem);

            subtotalBob += product.precioBob * itemDto.cantidad;
        }

        // 3. Calcular totales y guardar
        newOrder.totalBob = subtotalBob + (newOrder.costoEnvioBob || 0);

        // Opcional: Calcular total en USD si es necesario
        if (newOrder.totalBob > 0) {
            // Asumimos un tipo de cambio fijo o lo obtenemos de una config/servicio
            const exchangeRate = 6.96;
            newOrder.totalUsd = newOrder.totalBob / exchangeRate;
        }

        return this.repo.save(newOrder);
    }

    async update(id: number, dto: UpdateOrderDto) {
        const pedido = await this.repo.findOne({ where: { id } });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        Object.assign(pedido, dto);
        return this.repo.save(pedido);
    }

    async remove(id: number) {
        const pedido = await this.repo.findOneBy({ id });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        return this.repo.remove(pedido);
    }

    async getItems(id: number) {
        const pedido = await this.repo.findOne({
            where: { id },
            relations: ['items', 'items.producto'],
        });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        return pedido.items;
    }

    async asignarDireccion(id: number, dto: { direccionId: number }) {
        const pedido = await this.repo.findOneBy({ id });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        const direccion = await this.addrRepo.findOneBy({
            id: dto.direccionId,
        });
        if (!direccion) throw new NotFoundException('Dirección no encontrada');
        pedido.direccionEnvio = direccion;
        return this.repo.save(pedido);
    }

    async getDireccion(id: number) {
        const pedido = await this.repo.findOne({
            where: { id },
            relations: ['direccionEnvio'],
        });
        if (!pedido) throw new NotFoundException('Pedido no encontrado');
        return pedido.direccionEnvio;
    }

    async handleSuccessfulPayment(checkoutSession: any) {
        const orderId = parseInt(checkoutSession.metadata.orderId, 10);
        const order = await this.repo.findOne({
            where: { id: orderId },
            relations: ['usuario', 'direccionEnvio', 'items', 'items.producto'],
        });

        if (!order) {
            console.error(`Webhook: Pedido con ID ${orderId} no encontrado.`);
            return;
        }

        // 1. Actualizar el estado del pedido
        order.estado = OrderStatus.PAGADO;
        // 2. Crear un registro de pago asociado
        const payment = new Payment();
        payment.pedido = order;
        payment.metodo = 'stripe';
        payment.montoBob = order.totalBob;
        payment.montoUsd = order.totalUsd;
        payment.fechaPago = new Date();
        payment.estado = PaymentStatus.CONFIRMADO;
        payment.stripePaymentIntentId = checkoutSession.payment_intent;
        payment.stripeMetadata = { sessionId: checkoutSession.id };

        await this.repo.save(order);
        await this.paymentRepo.save(payment);

        // 3. Generar factura PDF
        const pdfBuffer = await this.generateInvoicePdf(order, payment);

        // 4. Enviar correo con la factura
        await this.mailService.sendOrderInvoice(
            order.usuario.correo,
            order,
            payment,
            pdfBuffer
        );

        console.log(`Pedido ${orderId} marcado como pagado y factura enviada.`);
    }

    async generateInvoicePdf(order: Order, payment: Payment): Promise<Buffer> {
        const doc = new PDFDocument();
        const bufferStream = new streamBuffers.WritableStreamBuffer();
        doc.pipe(bufferStream);

        // Encabezado
        doc
            .rect(0, 0, doc.page.width, 60)
            .fill('#2A3F32')
            .fillColor('#fff')
            .fontSize(24)
            .text('GlutenFreeHome', 40, 20, { align: 'left' })
            .fontSize(14)
            .text('Factura de Compra', { align: 'right', continued: false });
        doc.moveDown(2);
        doc.fillColor('#000');

        // Datos generales
        doc.fontSize(12).text(`Pedido: #${order.id}`);
        doc.text(`Fecha: ${new Date(payment.fechaPago).toLocaleString()}`);
        doc.text(`Cliente: ${order.usuario.nombreCompleto || order.usuario.nombreUsuario}`);
        doc.text(`Correo: ${order.usuario.correo}`);
        doc.text(`Dirección de envío: ${order.direccionEnvio ? `${order.direccionEnvio.linea1}${order.direccionEnvio.linea2 ? ', ' + order.direccionEnvio.linea2 : ''}, ${order.direccionEnvio.ciudad}, ${order.direccionEnvio.departamento}${order.direccionEnvio.codigoPostal ? ', ' + order.direccionEnvio.codigoPostal : ''}, ${order.direccionEnvio.pais}` : ''}`);
        doc.moveDown();

        // Línea divisoria
        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke('#2A3F32');
        doc.moveDown();

        // Tabla de productos
        doc.fontSize(13).text('Detalle de productos:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text('Producto', 50, doc.y, { continued: true });
        doc.text('Cantidad', 250, doc.y, { continued: true });
        doc.text('Precio unitario', 330, doc.y, { continued: true });
        doc.text('Subtotal', 440, doc.y);
        doc.moveDown(0.2);
        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke('#ccc');
        order.items.forEach((item) => {
            doc.text(item.producto.nombre, 50, doc.y, { continued: true });
            doc.text(`${item.cantidad}`, 250, doc.y, { continued: true });
            doc.text(`Bs ${Number(item.precioUnitBob).toFixed(2)}`, 330, doc.y, { continued: true });
            doc.text(`Bs ${(Number(item.precioUnitBob) * item.cantidad).toFixed(2)}`, 440, doc.y);
        });
        doc.moveDown();
        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke('#2A3F32');
        doc.moveDown();

        // Totales
        doc.fontSize(12).text(`Costo de envío: Bs ${Number(order.costoEnvioBob || 0).toFixed(2)}`, { align: 'right' });
        doc.fontSize(13).text(`Total: Bs ${Number(order.totalBob || 0).toFixed(2)}`, { align: 'right', bold: true });
        doc.moveDown();
        doc.fontSize(11).text(`Método de pago: Stripe`, { align: 'right' });
        doc.fontSize(10).text(`ID de pago: ${payment.stripePaymentIntentId}`, { align: 'right' });
        doc.moveDown(2);

        // Footer
        doc.fontSize(9).fillColor('#888').text('Gracias por tu compra en GlutenFreeHome. Si tienes dudas, contáctanos.', 40, doc.page.height - 60, { align: 'center' });
        doc.end();

        await new Promise((resolve) => bufferStream.on('finish', resolve));
        return bufferStream.getContents();
    }

    async findByUserId(userId: number) {
        return this.repo.find({
            where: { usuario: { id: userId } },
            relations: ['items', 'items.producto', 'direccionEnvio', 'pagos'],
            order: { createdAt: 'DESC' },
        });
    }
}
