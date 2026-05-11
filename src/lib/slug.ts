/**
 * Slug Generator
 *
 * Fungsi pure untuk generate slug dari nama mempelai.
 * Format: nama-pria-nama-wanita (lowercase, spasi diganti dash, karakter spesial dihapus)
 */

/**
 * Normalize a name string into a URL-friendly slug segment.
 * - Trim whitespace
 * - Convert to lowercase
 * - Remove non-alphanumeric characters (except spaces and dashes)
 * - Replace spaces with dashes
 * - Collapse multiple consecutive dashes into one
 */
function normalize(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generate a slug from groom and bride names.
 * Format: {normalized-groom}-{normalized-bride}
 *
 * @param groomName - Nama mempelai pria
 * @param brideName - Nama mempelai wanita
 * @returns Slug string in format nama-pria-nama-wanita
 */
export function generateSlug(groomName: string, brideName: string): string {
  const groomSlug = normalize(groomName);
  const brideSlug = normalize(brideName);

  return `${groomSlug}-${brideSlug}`;
}

/**
 * Ensure a slug is unique by appending a counter if needed.
 * If baseSlug already exists in existingSlugs, appends -1, -2, etc.
 *
 * @param baseSlug - The base slug to check
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug string
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) return baseSlug;

  let counter = 1;
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}
