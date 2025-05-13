/**
 * Utilities for handling slugs in list URLs
 */

/**
 * Convert a list name to a URL-friendly slug
 * @param name The list name to convert
 * @returns A URL-friendly slug
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60); // Limit length
}

// Module for slug to URI mapping
const slugToUriMap = new Map<string, string>();
const uriToSlugMap = new Map<string, string>();
const localStorageKey = 'bluelist_slug_mappings';

/**
 * Initialize the mapping store from localStorage (client-side only)
 */
export function init(): void {
  if (typeof window !== 'undefined' && import.meta.client) {
    try {
      const savedMappings = localStorage.getItem(localStorageKey);
      if (savedMappings) {
        const mappings = JSON.parse(savedMappings);
        Object.entries(mappings.slugToUri || {}).forEach(([slug, uri]) => {
          slugToUriMap.set(slug, uri as string);
        });
        Object.entries(mappings.uriToSlug || {}).forEach(([uri, slug]) => {
          uriToSlugMap.set(uri, slug as string);
        });
      }
    } catch (error) {
      console.error('Error loading slug mappings from localStorage:', error);
    }
  }
}

/**
 * Store a new mapping between a URI and slug
 * @param uri The list URI
 * @param name The list name
 * @returns The generated or existing slug
 */
export function addMapping(uri: string, name: string): string {
  if (!uri) throw new Error('URI is required for slug mapping');

  // If we already have a slug for this URI, return it
  const existingSlug = uriToSlugMap.get(uri);
  if (existingSlug) return existingSlug;

  // Ensure name is a string and not empty
  const safeName = name || 'untitled';

  // Generate a new slug from the name
  const baseSlug = createSlug(safeName);
  let slug = baseSlug;

  // Check for collisions and add a suffix if needed
  let counter = 1;
  while (slugToUriMap.has(slug) && slugToUriMap.get(slug) !== uri) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Store the mapping
  slugToUriMap.set(slug, uri);
  uriToSlugMap.set(uri, slug);

  // Save to localStorage if on client
  saveToLocalStorage();

  return slug;
}

/**
 * Get a list URI by its slug
 * @param slug The slug to look up
 * @returns The associated list URI or undefined if not found
 */
export function getUriBySlug(slug: string): string | undefined {
  return slugToUriMap.get(slug);
}

/**
 * Get a slug by list URI
 * @param uri The list URI to look up
 * @returns The associated slug or undefined if not found
 */
export function getSlugByUri(uri: string): string | undefined {
  return uriToSlugMap.get(uri);
}

/**
 * Save the mappings to localStorage (client-side only)
 */
function saveToLocalStorage(): void {
  if (typeof window !== 'undefined' && import.meta.client) {
    try {
      const mappings = {
        slugToUri: Object.fromEntries(slugToUriMap.entries()),
        uriToSlug: Object.fromEntries(uriToSlugMap.entries()),
      };
      localStorage.setItem(localStorageKey, JSON.stringify(mappings));
    } catch (error) {
      console.error('Error saving slug mappings to localStorage:', error);
    }
  }
}

// Initialize immediately if on client
if (typeof window !== 'undefined' && import.meta.client) {
  init();
}
