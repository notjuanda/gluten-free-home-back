# Configuración de Stripe para Gluten Free Home

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env`:

```env
# Configuración de Stripe (para pruebas)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_prueba
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_prueba
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_de_prueba
```

## Cómo obtener las claves de Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Asegúrate de estar en modo de **pruebas** (test mode)
3. Ve a **Developers > API keys**
4. Copia las claves:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

## Configurar Webhook

1. En el dashboard de Stripe, ve a **Developers > Webhooks**
2. Haz clic en **Add endpoint**
3. URL del endpoint: `https://tu-dominio.com/stripe/webhook`
4. Eventos a escuchar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copia el **Webhook signing secret** (`whsec_...`)

## Endpoints Disponibles

### Crear Payment Intent
```
POST /payments/stripe/create-payment-intent
```

Body:
```json
{
  "pedidoId": 1,
  "montoBob": 100.00,
  "montoUsd": 14.37,
  "stripeCustomerId": "cus_...",
  "stripePaymentMethodId": "pm_..."
}
```

### Confirmar Pago
```
POST /payments/stripe/confirm-payment
```

Body:
```json
{
  "paymentIntentId": "pi_...",
  "paymentMethodId": "pm_..."
}
```

### Obtener Clave Pública
```
GET /payments/stripe/publishable-key
```

### Webhook
```
POST /stripe/webhook
```

## Flujo de Pago

1. **Crear Payment Intent**: El frontend llama a `/payments/stripe/create-payment-intent`
2. **Confirmar Pago**: El frontend usa el `clientSecret` para confirmar el pago con Stripe
3. **Webhook**: Stripe notifica al backend sobre el estado del pago
4. **Actualizar Estado**: El backend actualiza el estado del pago en la base de datos

## Notas Importantes

- **Siempre usa claves de prueba** para desarrollo
- **Nunca expongas la clave secreta** en el frontend
- **Verifica las firmas de webhook** para seguridad
- **Maneja errores** apropiadamente en el frontend
- **Usa HTTPS** en producción para los webhooks 