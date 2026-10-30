import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return (
    <div>
      <h1 className="heading mb-6 text-3xl sm:text-4xl">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
