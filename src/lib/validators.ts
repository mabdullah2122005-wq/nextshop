import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email").transform((e) => e.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.email().transform((e) => e.toLowerCase()),
  password: z.string().min(1),
});

export const checkoutSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Cart is empty")
    .max(50),
});

export const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and dashes")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().min(1).max(5000),
  priceCents: z.number().int().min(50, "Minimum price is 0.50"),
  imageUrl: z.url("Image must be a valid URL"),
  stock: z.number().int().min(0),
  active: z.boolean(),
  featured: z.boolean(),
  categoryId: z.string().nullable().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const userRoleSchema = z.object({ role: z.enum(["CUSTOMER", "ADMIN"]) });

export type ProductInput = z.infer<typeof productSchema>;
