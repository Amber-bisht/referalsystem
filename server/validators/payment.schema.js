const { z } = require('zod');

const createOrderSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID')
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID')
});

const withdrawSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
  brand: z.string().optional()
});

const createCartOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
    quantity: z.number().min(1)
  })).min(1, 'Cart is empty')
});

const verifyCartPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
  items: z.array(z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
    quantity: z.number().min(1)
  }))
});

module.exports = {
  createOrderSchema,
  verifyPaymentSchema,
  withdrawSchema,
  payWithWalletSchema,
  createCartOrderSchema,
  verifyCartPaymentSchema
};
