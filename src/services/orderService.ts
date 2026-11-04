import { Order, OrderStatus } from '../types';
import { db } from '../lib/storage';

export interface PlaceOrderInput {
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  couponId?: string | null;
  couponCode?: string | null;
  discountAmount?: number;
  notes?: string;
}

export const orderService = {
  placeOrder: (input: PlaceOrderInput): Order => {
    // Validate stock and build order items with snapshots
    const orderItems = input.items.map((cartItem) => {
      const product = db.getProductById(cartItem.productId);
      if (!product) {
        throw new Error(`Product with ID "${cartItem.productId}" was not found.`);
      }
      if (product.stock < cartItem.quantity) {
        throw new Error(
          `Insufficient stock for "${product.title}". Requested: ${cartItem.quantity}, In Stock: ${product.stock}`
        );
      }

      return {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        order_id: '',
        product_id: product.id,
        seller_id: product.seller_id,
        title: product.title,
        thumbnail: product.thumbnail_url || '',
        price: product.price,
        quantity: cartItem.quantity,
        line_total: product.price * cartItem.quantity,
      };
    });

    const subtotal = orderItems.reduce((acc, curr) => acc + curr.line_total, 0);
    const discount = input.discountAmount || 0;
    const total = Math.max(0, subtotal - discount);

    const order = db.createOrder({
      customer_id: input.customerId,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      shipping_address: input.shippingAddress,
      subtotal,
      discount_amount: discount,
      total,
      coupon_id: input.couponId || null,
      coupon_code: input.couponCode || null,
      payment_method: 'cod',
      status: 'placed',
      notes: input.notes,
      items: orderItems,
    });

    return order;
  },

  getOrderById: (orderId: string): Order | undefined => {
    return db.getOrderById(orderId);
  },

  getCustomerOrders: (customerId: string): Order[] => {
    return db.getCustomerOrders(customerId);
  },

  getSellerOrders: (sellerId: string): Order[] => {
    return db.getSellerOrders(sellerId);
  },

  getAllOrdersAdmin: (): Order[] => {
    return db.getOrders().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    note?: string,
    changedBy?: string
  ): Order => {
    return db.updateOrderStatus(orderId, status, note, changedBy);
  },

  cancelOrder: (orderId: string, customerId: string, reason?: string): Order => {
    const order = db.getOrderById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.customer_id !== customerId) {
      throw new Error('Unauthorized to cancel this order');
    }
    // Business Rule 7: Order cancel sirf "Placed" ya "Confirmed" status tak ho sakta hai
    if (order.status !== 'placed' && order.status !== 'confirmed') {
      throw new Error(`Order cannot be cancelled in "${order.status}" status.`);
    }

    return db.updateOrderStatus(
      orderId,
      'cancelled',
      reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer',
      customerId
    );
  },
};
