import { db } from "@/lib/db";
import { images, type Image } from "@/lib/db/schema";
import { and, or, eq, ilike, sql, desc, inArray } from "drizzle-orm";

export interface FindImagesOptions {
  material?: string;
  subjects?: string[];
  shotType?: string;
  who?: string[];
  setting?: string;
  customTags?: string[];
  query?: string;
  limit?: number;
  includeHidden?: boolean;
}

export interface ImageMatch extends Image {
  matchScore: number;
}

/**
 * Find images from the library. ALWAYS call this before assigning any
 * /images/* path in blog posts, tools, product pages, or any other file.
 *
 * Do NOT pick images by listing public/images/. Do NOT guess from filename.
 * If nothing matches well, stop and ask Jesper to upload — don't fall back
 * to a similar-looking file.
 *
 * @example
 * const matches = await findImages({ material: "plywood", shotType: "detail" });
 * // matches[0].url is the URL to use in heroImage/featuredImage
 *
 * @example
 * const matches = await findImages({ query: "workshop overview", limit: 5 });
 */
export async function findImages(options: FindImagesOptions = {}): Promise<ImageMatch[]> {
  const {
    material,
    subjects,
    shotType,
    who,
    setting,
    customTags,
    query,
    limit = 20,
    includeHidden = false,
  } = options;

  const conditions = [];

  if (!includeHidden) {
    conditions.push(eq(images.hidden, false));
  }

  if (material) {
    conditions.push(eq(images.material, material));
  }
  if (shotType) {
    conditions.push(eq(images.shotType, shotType));
  }
  if (setting) {
    conditions.push(eq(images.setting, setting));
  }

  if (subjects && subjects.length > 0) {
    conditions.push(sql`${images.subjects} && ${subjects}`);
  }
  if (who && who.length > 0) {
    conditions.push(sql`${images.who} && ${who}`);
  }
  if (customTags && customTags.length > 0) {
    conditions.push(sql`${images.customTags} && ${customTags}`);
  }

  if (query && query.trim()) {
    const q = `%${query.trim()}%`;
    conditions.push(
      or(
        ilike(images.description, q),
        ilike(images.filename, q),
        sql`EXISTS (SELECT 1 FROM unnest(${images.customTags}) AS t WHERE t ILIKE ${q})`,
        sql`EXISTS (SELECT 1 FROM unnest(${images.subjects}) AS s WHERE s ILIKE ${q})`
      )
    );
  }

  const rows = await db
    .select()
    .from(images)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(images.reviewed), desc(images.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    matchScore: scoreMatch(row, options),
  })).sort((a, b) => b.matchScore - a.matchScore);
}

function scoreMatch(image: Image, options: FindImagesOptions): number {
  let score = 0;
  if (options.material && image.material === options.material) score += 5;
  if (options.shotType && image.shotType === options.shotType) score += 3;
  if (options.setting && image.setting === options.setting) score += 2;
  if (options.subjects) {
    const overlap = options.subjects.filter((s) => image.subjects.includes(s)).length;
    score += overlap * 3;
  }
  if (options.who) {
    const overlap = options.who.filter((w) => image.who.includes(w)).length;
    score += overlap * 2;
  }
  if (options.customTags) {
    const overlap = options.customTags.filter((t) => image.customTags.includes(t)).length;
    score += overlap * 2;
  }
  if (image.reviewed) score += 1;
  return score;
}

export async function getImageById(id: string) {
  const rows = await db.select().from(images).where(eq(images.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getImagesByIds(ids: string[]) {
  if (!ids.length) return [];
  return db.select().from(images).where(inArray(images.id, ids));
}
