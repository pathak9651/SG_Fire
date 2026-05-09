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
    // Construct the query string from Next.js searchParams
    const query = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        query.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(v => query.append(key, v));
      }
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/products?${query.toString()}`, {
      // Revalidate occasionally, but since it's force-dynamic it runs on request
      next: { revalidate: 60 } 
    });

    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [], totalProducts: 0, totalPages: 1, currentPage: 1 };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const data = await getProducts(searchParams);

  return (
    <ProductsClient 
      initialProducts={data.data || []}
      totalProducts={data.totalProducts || 0}
      totalPages={data.totalPages || 1}
      currentPage={data.currentPage || 1}
    />
  );
}
