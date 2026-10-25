"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, trainingPrograms } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { programSchema } from "@/lib/validations/program";

async function programSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await db.query.trainingPrograms.findFirst({
    columns: { id: true },
    where: and(eq(trainingPrograms.slug, slug), excludeId ? ne(trainingPrograms.id, excludeId) : undefined),
  });
  return found !== undefined;
}

function revalidateProgramPaths(slugs: (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/du-hoc-dao-tao");
  revalidatePath("/sitemap.xml");
  for (const s of new Set(slugs.filter((v): v is string => !!v))) revalidatePath(`/du-hoc-dao-tao/${s}`);
  revalidatePath("/admin/dao-tao");
}

export async function createProgram(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = programSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const slug = await uniqueSlug(slugify(d.slug || d.title) || "chuong-trinh", (s) => programSlugExists(s));
    const [program] = await db
      .insert(trainingPrograms)
      .values({
        title: d.title,
        slug,
        type: d.type,
        summary: d.summary || null,
        content: d.content,
        image: d.image || null,
        duration: d.duration || null,
        tuition: d.tuition || null,
        order: Number(d.order) || 0,
        isActive: d.isActive,
      })
      .returning({ id: trainingPrograms.id, slug: trainingPrograms.slug });
    revalidateProgramPaths([program.slug]);
    return ok({ id: program.id, slug: program.slug }, "Đã tạo chương trình");
  });
}

export async function updateProgram(id: string, input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = programSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const current = await db.query.trainingPrograms.findFirst({ columns: { slug: true }, where: eq(trainingPrograms.id, id) });
    if (!current) return fail("Chương trình không tồn tại hoặc đã bị xóa.");
    const slug = await uniqueSlug(slugify(d.slug || d.title) || "chuong-trinh", (s) => programSlugExists(s, id));
    const [program] = await db
      .update(trainingPrograms)
      .set({
        title: d.title,
        slug,
        type: d.type,
        summary: d.summary || null,
        content: d.content,
        image: d.image || null,
        duration: d.duration || null,
        tuition: d.tuition || null,
        order: Number(d.order) || 0,
        isActive: d.isActive,
      })
      .where(eq(trainingPrograms.id, id))
      .returning({ id: trainingPrograms.id, slug: trainingPrograms.slug });
    revalidateProgramPaths([current.slug, program.slug]);
    return ok({ id: program.id, slug: program.slug }, "Đã lưu chương trình");
  });
}

export async function deleteProgram(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const program = await db.query.trainingPrograms.findFirst({ columns: { slug: true }, where: eq(trainingPrograms.id, id) });
    if (!program) return fail("Chương trình không tồn tại hoặc đã bị xóa.");
    await db.delete(trainingPrograms).where(eq(trainingPrograms.id, id));
    revalidateProgramPaths([program.slug]);
    return ok(undefined, "Đã xóa chương trình");
  });
}
