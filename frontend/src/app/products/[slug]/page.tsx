import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

// We can revalidate product pages every hour to keep cache fresh
export const revalidate = 3600;

async function getProduct(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/products/${slug}`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch product');
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getRelatedProducts(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/products/related/${id}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data;
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found | SG Fire',
    };
  }

  return {
    title: `${product.title} | SG Fire`,
    description: product.metaDescription || product.shortDescription || `Buy ${product.title} at SG Fire.`,
    keywords: product.tags?.join(', ') || 'fire safety, equipment',
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product._id);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
