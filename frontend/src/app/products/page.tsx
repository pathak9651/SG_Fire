import { Metadata } from 'next';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Products | SG Fire',
  description: 'Browse our premium selection of fire safety equipment and services.',
};

// Force dynamic since search params change frequently
export const dynamic = 'force-dynamic';

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const query = new URLSearchParams();
    query.append('isActive', 'true'); // Only show active products to public users
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') query.append(key, value);
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/products?${query.toString()}`, {
      cache: 'no-store' // Disable caching to show new products immediately
    });

    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (error) {
    return { data: [], totalProducts: 0, totalPages: 1, currentPage: 1 };
  }
}

async function getCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/categories`, { cache: 'no-store' });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [productsData, categories] = await Promise.all([
    getProducts(resolvedSearchParams),
    getCategories()
  ]);

  return (
    <ProductsClient 
      initialProducts={productsData.data || []}
      totalProducts={productsData.totalProducts || 0}
      totalPages={productsData.totalPages || 1}
      currentPage={productsData.currentPage || 1}
      categories={categories}
    />
  );
}
