/**
 * SEO utility — sets document <title> and <meta> tags dynamically.
 * Call useSEO() in any page component.
 */
import { useEffect } from 'react';

const DEFAULT = {
  title: 'AnimeNation India — Premium Anime Merchandise',
  description: 'India\'s #1 anime merchandise store. Shop T-shirts, hoodies, figures, manga & more. COD available. Free shipping above ₹999.',
  image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80',
  url: 'https://animenation.in',
};

function setMeta(name, content, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

function injectSchema(id, schema) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

function removeSchema(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

export function useSEO({ title, description, image, url, schema, schemaId = 'page-schema' } = {}) {
  useEffect(() => {
    const t = title ? `${title} | AnimeNation India` : DEFAULT.title;
    const d = description || DEFAULT.description;
    const img = image || DEFAULT.image;
    const u = url ? `${DEFAULT.url}${url}` : DEFAULT.url;

    document.title = t;

    // Standard meta
    setMeta('description', d);
    setMeta('robots', 'index, follow');

    // Open Graph
    setMeta('og:type', 'website', true);
    setMeta('og:title', t, true);
    setMeta('og:description', d, true);
    setMeta('og:image', img, true);
    setMeta('og:url', u, true);
    setMeta('og:site_name', 'AnimeNation India', true);
    setMeta('og:locale', 'en_IN', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', t);
    setMeta('twitter:description', d);
    setMeta('twitter:image', img);

    // Canonical
    setCanonical(u);

    // JSON-LD schema
    if (schema) {
      injectSchema(schemaId, schema);
    }

    return () => {
      if (schema) removeSchema(schemaId);
    };
  }, [title, description, image, url, schema, schemaId]);
}

/** Build Product schema (JSON-LD) from a product record */
export function buildProductSchema(product) {
  if (!product) return null;
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: product.image_url ? [product.image_url] : [],
    sku: product.id,
    brand: { '@type': 'Brand', name: 'AnimeNation India' },
    offers: {
      '@type': 'Offer',
      url: `https://animenation.in/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'AnimeNation India' },
    },
    aggregateRating: product.rating > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.review_count || 1,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}

/** Build Article / BlogPosting schema */
export function buildBlogSchema(post) {
  if (!post) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ? [post.cover_image] : [],
    author: { '@type': 'Person', name: post.author || 'AnimeNation Team' },
    publisher: {
      '@type': 'Organization',
      name: 'AnimeNation India',
      logo: { '@type': 'ImageObject', url: 'https://animenation.in/logo.png' },
    },
    datePublished: post.published_date || post.created_date,
    dateModified: post.updated_date || post.created_date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://animenation.in/blog/${post.slug}` },
  };
}

/** Build Website / Organization schema for the homepage */
export const SITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AnimeNation India',
  url: 'https://animenation.in',
  logo: 'https://animenation.in/logo.png',
  description: "India's #1 anime merchandise store.",
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://instagram.com/animenationIndia',
    'https://twitter.com/animenationIndia',
  ],
};

/** Build BreadcrumbList schema */
export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://animenation.in${item.path}`,
    })),
  };
}