import { Order, CartItem } from '../types';
import { formatPrice } from './utils';

export const ZENVO_WHATSAPP_RAW = '03027628552';
export const ZENVO_WHATSAPP_INTL = '923027628552';

/**
 * Generates formatted WhatsApp text for a placed order
 */
export function formatWhatsAppOrderMessage(order: Order): string {
  const itemsText = order.items && order.items.length > 0
    ? order.items
        .map(
          (item, idx) => {
            const title = item.title || (item as any).title_snapshot || 'Product';
            const price = item.price || (item as any).unit_price || 0;
            const lineTotal = item.line_total || (item as any).subtotal || (price * item.quantity);
            return `${idx + 1}. *${title}*\n   Qty: ${item.quantity} × ${formatPrice(price)} = ${formatPrice(lineTotal)}`;
          }
        )
        .join('\n\n')
    : 'No items listed';

  const address = order.shipping_address;
  const addressText = [
    address.address_line1,
    address.address_line2,
    `${address.city}, ${address.state} ${address.postal_code}`,
  ]
    .filter(Boolean)
    .join(', ');

  return `🛍️ *NEW ZENVO ORDER NOTIFICATION* 🛍️
━━━━━━━━━━━━━━━━━━━━━
*Order ID:* ${order.order_number}
*Status:* ${order.status.toUpperCase()}
*Payment:* Cash on Delivery (COD)

👤 *CUSTOMER DETAILS:*
• *Name:* ${order.customer_name}
• *Phone:* ${address.phone}
• *Email:* ${order.customer_email}

📍 *DELIVERY ADDRESS:*
${addressText}

📦 *ITEMS ORDERED:*
${itemsText}

━━━━━━━━━━━━━━━━━━━━━
💰 *ORDER SUMMARY:*
• Subtotal: ${formatPrice(order.subtotal)}
• Discount: ${order.discount_amount > 0 ? `-${formatPrice(order.discount_amount)}` : 'PKR 0'}
• Delivery: FREE Delivery across Pakistan
• *TOTAL AMOUNT (COD):* *${formatPrice(order.total)}*
━━━━━━━━━━━━━━━━━━━━━
${order.notes ? `📝 *Special Instructions:* ${order.notes}\n━━━━━━━━━━━━━━━━━━━━━\n` : ''}
Assalam-o-Alaikum! Please confirm my Zenvo order dispatch. Shukriya!`;
}

/**
 * Returns direct WhatsApp link for an order
 */
export function getWhatsAppOrderUrl(order: Order, phone: string = ZENVO_WHATSAPP_INTL): string {
  const message = formatWhatsAppOrderMessage(order);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}

/**
 * Formats a quick order directly from cart or single product
 */
export function getWhatsAppQuickOrderUrl(params: {
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  total: number;
  deliveryCity?: string;
}): string {
  const itemsList = params.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.title}*\n   Qty: ${item.quantity} × ${formatPrice(item.product.price)}`
    )
    .join('\n');

  const text = `🛍️ *DIRECT WHATSAPP ORDER INQUIRY* 🛍️
Assalam-o-Alaikum Zenvo Team! Main ye products order karna chahta/chahti hoon via Cash on Delivery:

${itemsList}

💰 *Estimated Total:* ${formatPrice(params.total)} (Pay on Delivery)
${params.customerName ? `👤 *Name:* ${params.customerName}\n` : ''}${params.customerPhone ? `📞 *Phone:* ${params.customerPhone}\n` : ''}${params.deliveryCity ? `📍 *City:* ${params.deliveryCity}\n` : ''}
Meharbani farma kar order details confirm karein. Shukriya!`;

  return `https://api.whatsapp.com/send?phone=${ZENVO_WHATSAPP_INTL}&text=${encodeURIComponent(text)}`;
}

/**
 * Direct WhatsApp support link
 */
export function getWhatsAppSupportUrl(customMessage?: string): string {
  const defaultText = `Assalam-o-Alaikum Zenvo Support! Mujhe marketplace ke baare mein maloomat chahiye.`;
  const text = customMessage || defaultText;
  return `https://api.whatsapp.com/send?phone=${ZENVO_WHATSAPP_INTL}&text=${encodeURIComponent(text)}`;
}
