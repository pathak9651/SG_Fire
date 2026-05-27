import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

// Force dynamic to show newly uploaded or edited products instantly
export const dynamic = 'force-dynamic';

async function getProduct(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const res = await fetch(`${apiUrl}/products/slug/${slug}`, {
      cache: 'no-store'
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const res = await fetch(`${apiUrl}/products/related/${id}`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data;
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product._id);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
