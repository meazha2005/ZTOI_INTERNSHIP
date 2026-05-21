import { MetadataRoute } from 'next';
import { seoRoutes } from '@/lib/seo-routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.PUBLIC_URL || process.env.SITE_URL || 'http://localhost:3001';
  return seoRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: route.lastmod ? new Date(route.lastmod) : new Date(),
    changeFrequency: route.changefreq as any || 'weekly',
    priority: route.priority !== undefined ? route.priority : 0.8,
  }));
}
