import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-guard";
import { storeImage, UploadError } from "@/lib/upload";

/**
 * POST /api/admin/upload – upload 1 ảnh (multipart/form-data, field "file", tùy chọn "alt").
 * Dùng bởi trình soạn thảo, trường chọn ảnh và thư viện ảnh trong admin.
 */
function toInt(value: FormDataEntryValue | null | undefined): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Thiếu file ảnh." }, { status: 400 });

  try {
    const media = await storeImage(file, {
      uploadedById: user.id,
      alt: typeof formData?.get("alt") === "string" ? String(formData.get("alt")) : undefined,
      width: toInt(formData?.get("width")),
      height: toInt(formData?.get("height")),
    });
    return NextResponse.json({
      id: media.id,
      url: media.url,
      width: media.width,
      height: media.height,
      filename: media.filename,
      alt: media.alt,
    });
  } catch (error) {
    if (error instanceof UploadError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[upload]", error);
    return NextResponse.json({ error: "Không thể upload ảnh, vui lòng thử lại." }, { status: 500 });
  }
}
