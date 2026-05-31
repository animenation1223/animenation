import React from 'react';
import { base44 } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useSEO, SITE_SCHEMA } from '@/lib/seo';
import HeroSection from '../components/features/home/HeroSection';
import CategoriesStrip from '../components/features/home/CategoriesStrip';
import ProductSection from '../components/features/home/ProductSection';
import AnimeSeriesGrid from '../components/features/home/AnimeSeriesGrid';
import ReviewsSection from '../components/features/home/ReviewsSection';
import NewsletterSection from '../components/features/home/NewsletterSection';
import OfferBanners from '../components/features/home/OfferBanners';
import TrendingTicker from '../components/features/home/TrendingTicker';
import FloatingSaleBanner from '../components/features/home/FloatingSaleBanner';
import LimitedEditionSection from '../components/features/home/LimitedEditionSection';
import BlogPreviewSection from '../components/features/home/BlogPreviewSection';

export default function Home() {
  useSEO({
    title: undefined, // use default
    description: "India's #1 anime merchandise store. Shop Naruto, One Piece, Demon Slayer T-shirts, hoodies, figures & more. COD available. Free shipping above ₹999.",
    url: '/',
    schema: SITE_SCHEMA,
    schemaId: 'org-schema',
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', 50),
    initialData: [],
  });

  const trending = products.filter(p => p.tags?.includes('trending'));
  const bestsellers = products.filter(p => p.tags?.includes('bestseller'));
  const newArrivals = products.filter(p => p.tags?.includes('new-arrival'));
  const limited = products.filter(p => p.tags?.includes('limited'));

  const showMostWanted = (trending.length > 0 ? trending : products).slice(0, 8);
  const showFanFavs = (bestsellers.length > 0 ? bestsellers : products).slice(0, 8);
  const showTrendingIndia = products.slice(0, 8);
  const showNewDrops = (newArrivals.length > 0 ? newArrivals : products).slice(0, 8);
  const showLimited = (limited.length > 0 ? limited : products).slice(0, 4);

  return (
    <div className="pb-16 sm:pb-0">
      <HeroSection />

      <TrendingTicker />

      <OfferBanners />

      <CategoriesStrip />

      <div className="neon-line" />

      <ProductSection
        title="Most Wanted Anime Drops 🔥"
        subtitle="The hottest picks the Otaku community is grabbing right now"
        products={showMostWanted}
        link="/products?tag=trending"
        isLoading={isLoading}
      />

      <AnimeSeriesGrid />

      <LimitedEditionSection products={showLimited} isLoading={isLoading} />

      <ProductSection
        title="Fan Favorites ⭐"
        subtitle="Our all-time bestsellers — approved by thousands of Otakus"
        products={showFanFavs}
        link="/products?tag=bestseller"
        isLoading={isLoading}
      />

      <ProductSection
        title="Trending in India 🇮🇳"
        subtitle="What Indian anime fans are obsessing over this season"
        products={showTrendingIndia}
        link="/products"
        isLoading={isLoading}
      />

      <ProductSection
        title="New Season Drops ✨"
        subtitle="Fresh prints, just dropped — be the first to grab them"
        products={showNewDrops}
        link="/products?tag=new-arrival"
        isLoading={isLoading}
      />

      <div className="neon-line" />
      <BlogPreviewSection />

      <ReviewsSection />
      <NewsletterSection />

      <FloatingSaleBanner />
    </div>
  );
}