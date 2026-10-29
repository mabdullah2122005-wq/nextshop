import { z } from "zod";

const email = z.email("Enter a valid email").transform((e) => e.toLowerCase());
const password = z.string().min(8, "Password must be at least 8 characters").max(100);

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email,
  password,
});

export const loginSchema = z.object({
  email: z.email().transform((e) => e.toLowerCase()),
  password: z.string().min(1),
});

export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ token: z.string().min(20).max(200), password });
export const newsletterSchema = z.object({ email });

export const checkoutSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Cart is empty")
    .max(50),
  couponCode: z.string().trim().max(40).optional(),
});

export const couponCheckSchema = z.object({
  code: z.string().trim().min(1, "Enter a code").max(40),
  subtotalCents: z.number().int().min(0),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating").max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
});

export const wishlistSchema = z.object({ productId: z.string().min(1) });

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
  compareAtCents: z.number().int().min(0).nullable().optional(),
  imageUrl: z.url("Image must be a valid URL"),
  stock: z.number().int().min(0),
  active: z.boolean(),
  featured: z.boolean(),
  categoryId: z.string().nullable().optional(),
});

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only")
      .transform((c) => c.toUpperCase()),
    kind: z.enum(["PERCENT", "FIXED"]),
    value: z.number().int().min(1),
    minOrderCents: z.number().int().min(0).default(0),
    maxUses: z.number().int().min(1).nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    active: z.boolean().default(true),
  })
  .refine((c) => c.kind !== "PERCENT" || c.value <= 100, { message: "Percent must be 1–100", path: ["value"] });

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const userRoleSchema = z.object({ role: z.enum(["CUSTOMER", "ADMIN"]) });

export type ProductInput = z.infer<typeof productSchema>;
