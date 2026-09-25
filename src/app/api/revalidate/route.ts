import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag("woocommerce", "max");
  return Response.json({ ok: true });
}
