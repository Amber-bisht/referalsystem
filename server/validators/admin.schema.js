const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  profit: z.number().nonnegative(),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.string().length(0)),
  stock: z.number().int().nonnegative(),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID').optional().or(z.string().length(0))
});

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required')
});

const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  productSlug: z.string().optional(),
  isActive: z.boolean().default(true)
});

module.exports = {
  productSchema,
  categorySchema,
  bannerSchema
};
