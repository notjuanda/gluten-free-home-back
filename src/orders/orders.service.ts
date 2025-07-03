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
        const doc = new PDFDocument({ margin: 40 });
        const bufferStream = new streamBuffers.WritableStreamBuffer();
        doc.pipe(bufferStream);

        // Encabezado
        doc
            .rect(0, 0, doc.page.width, 60)
            .fill('#2A3F32')
            .fillColor('#fff')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('GlutenFreeHome', 40, 20, { align: 'left' })
            .fontSize(16)
            .text('Factura de Compra', 0, 32, { align: 'right' });
        doc.moveDown(2);
        doc.fillColor('#000').font('Helvetica');

        // Cabecera de datos del pedido en recuadro, campos alineados verticalmente y con más espacio
        const headerX = 40;
        let headerY = doc.y;
        const headerWidth = doc.page.width - 80;
        const padding = 18;
        let cursorY = headerY + padding;
        const lineSpacing = 22;
        // Calcular altura dinámica
        let headerHeight = 0;
        // Medir dirección
        let direccionLines: string[] = [];
        if (order.direccionEnvio) {
            direccionLines.push(order.direccionEnvio.linea1);
            if (order.direccionEnvio.linea2) direccionLines.push(order.direccionEnvio.linea2);
            direccionLines.push(`${order.direccionEnvio.ciudad}, ${order.direccionEnvio.departamento}`);
            if (order.direccionEnvio.codigoPostal) direccionLines.push(`CP: ${order.direccionEnvio.codigoPostal}`);
            if (order.direccionEnvio.pais) direccionLines.push(order.direccionEnvio.pais);
        }
        headerHeight = 4 * lineSpacing + direccionLines.length * 16 + padding * 2 + 10;
        doc.roundedRect(headerX, headerY, headerWidth, headerHeight, 10).stroke('#2A3F32');
        // Campos con títulos alineados a la izquierda y valores a la derecha
        const labelX = headerX + 20;
        const valueX = headerX + 160;
        doc.fontSize(13).font('Helvetica-Bold').text(`Pedido: #${order.id}`, labelX, cursorY);
        doc.font('Helvetica').fontSize(13).text(`Fecha: ${new Date(payment.fechaPago).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}`, valueX, cursorY);
        cursorY += lineSpacing;
        doc.font('Helvetica-Bold').text('Cliente:', labelX, cursorY);
        doc.font('Helvetica').text(`${order.usuario.nombreCompleto || order.usuario.nombreUsuario}`, valueX, cursorY);
        cursorY += lineSpacing;
        doc.font('Helvetica-Bold').text('Correo:', labelX, cursorY);
        doc.font('Helvetica').text(`${order.usuario.correo}`, valueX, cursorY);
        cursorY += lineSpacing;
        doc.font('Helvetica-Bold').text('Dirección de envío:', labelX, cursorY);
        cursorY += lineSpacing - 6;
        doc.font('Helvetica').fontSize(12);
        direccionLines.forEach(line => {
            doc.text(line, labelX + 20, cursorY);
            cursorY += 16;
        });
        doc.y = headerY + headerHeight + 10;

        // Línea divisoria
        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke('#2A3F32');
        doc.moveDown();

        // Tabla de productos
        doc.fontSize(13).font('Helvetica-Bold').text('Detalle de productos:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica-Bold');
        const tableTop = doc.y;
        const col1 = 50, col2 = 250, col3 = 350, col4 = 470;
        const rowHeight = 18;
        // Encabezados
        doc.text('Producto', col1, tableTop, { continued: true });
        doc.text('Cantidad', col2, tableTop, { continued: true });
        doc.text('Precio unitario', col3, tableTop, { continued: true });
        doc.text('Subtotal', col4, tableTop);
        doc.moveDown(0.2);
        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke('#ccc');
        let subtotalBob = 0;
        doc.font('Helvetica');
        let y = doc.y;
        order.items.forEach((item, idx) => {
            if (idx % 2 === 1) {
                // Fila alterna gris claro
                doc.rect(40, y - 1, doc.page.width - 80, rowHeight).fill('#f6f6f6').fillColor('#000');
            }
            doc.text(item.producto.nombre, col1, y, { continued: true });
            doc.text(`${item.cantidad}`, col2, y, { continued: true });
            doc.text(`Bs ${Number(item.precioUnitBob).toFixed(2)}`, col3, y, { continued: true });
            const subtotal = Number(item.precioUnitBob) * item.cantidad;
            doc.text(`Bs ${subtotal.toFixed(2)}`, col4, y);
            subtotalBob += subtotal;
            if (idx % 2 === 1) doc.fillColor('#000');
            y += rowHeight;
        });
        doc.y = y;
        doc.moveDown(0.2);
        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke('#2A3F32');
        doc.moveDown(0.5);

        // Subtotal y totales (alineados a la derecha, uno debajo del otro)
        const rightCol = col4;
        doc.fontSize(12).font('Helvetica-Bold').text(`Subtotal: Bs ${subtotalBob.toFixed(2)}`, rightCol, doc.y, { align: 'right' });
        doc.font('Helvetica').fontSize(12).text(`Costo de envío: Bs ${Number(order.costoEnvioBob || 0).toFixed(2)}`, rightCol, doc.y + 16, { align: 'right' });
        doc.font('Helvetica-Bold').fontSize(15).fillColor('#2A3F32').text(`Total: Bs ${Number(order.totalBob || 0).toFixed(2)}`, rightCol, doc.y + 32, { align: 'right' });
        doc.fillColor('#000');

        // Pagado con Stripe justo debajo del total
        doc.font('Helvetica').fontSize(10).fillColor('#888').text('Pagado con Stripe', rightCol, doc.y + 50, { align: 'right' });
        doc.fillColor('#000');

        // Mensaje de agradecimiento, centrado, justo después
        doc.moveDown(1);
        doc.fontSize(10).fillColor('#888').text('Gracias por tu compra en GlutenFreeHome. Si tienes dudas, contáctanos respondiendo este correo.', { align: 'center' });
        doc.end();

        await new Promise((resolve) => bufferStream.on('finish', resolve));
        return bufferStream.getContents();
    }

    async findByUserId(userId: number) {
        console.log('findByUserId - userId:', userId);
        const result = await this.repo.find({
            where: { usuario: { id: userId } },
            relations: ['usuario', 'items', 'items.producto', 'direccionEnvio', 'pagos'],
            order: { createdAt: 'DESC' },
        });
        return result;
    }
}
