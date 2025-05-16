import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.squabbl.co.za'; // Replace with your actual domain

  // Add your static pages here
  const staticPages = [
    '',
    '/about',
    '/how-to-play',
    // Add other static paths, e.g., '/pricing', '/contact'
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'monthly', // Homepage might change more often
    priority: path === '' ? 1 : 0.8, 
  }));

  // If you have dynamic routes (e.g., game/[gameId]), you would fetch them here
  // and add them to sitemapEntries.
  // Example (pseudo-code):
  // const gameIds = await fetchActiveGameIdsFromDb();
  // const dynamicGamePageEntries = gameIds.map(id => ({
  //   url: `${baseUrl}/game/${id}`,
  //   lastModified: new Date(), 
  //   changeFrequency: 'weekly',
  //   priority: 0.7,
  // }));
  // sitemapEntries.push(...dynamicGamePageEntries);

  return sitemapEntries;
} 