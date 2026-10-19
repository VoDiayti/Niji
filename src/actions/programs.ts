"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { programSchema } from "@/lib/validations/program";

async function programSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await prisma.trainingProgram.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return found !== null;
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
    const program = await prisma.trainingProgram.create({
      data: {
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
      },
    });
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
    const current = await prisma.trainingProgram.findUnique({ where: { id }, select: { slug: true } });
    if (!current) return fail("Chương trình không tồn tại hoặc đã bị xóa.");
    const slug = await uniqueSlug(slugify(d.slug || d.title) || "chuong-trinh", (s) => programSlugExists(s, id));
    const program = await prisma.trainingProgram.update({
      where: { id },
      data: {
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
      },
    });
    revalidateProgramPaths([current.slug, program.slug]);
    return ok({ id: program.id, slug: program.slug }, "Đã lưu chương trình");
  });
}

export async function deleteProgram(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const program = await prisma.trainingProgram.findUnique({ where: { id }, select: { slug: true } });
    if (!program) return fail("Chương trình không tồn tại hoặc đã bị xóa.");
    await prisma.trainingProgram.delete({ where: { id } });
    revalidateProgramPaths([program.slug]);
    return ok(undefined, "Đã xóa chương trình");
  });
}
