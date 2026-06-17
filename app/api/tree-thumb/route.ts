import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { normalizeChaImageUrl } from "@/lib/cha/image-url";

const ALLOWED_HOST = "www.khs.go.kr";
const ALLOWED_PATH_PREFIX = "/unisearch/images/";

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const normalized = normalizeChaImageUrl(rawUrl);
  if (!normalized) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (
    parsed.hostname !== ALLOWED_HOST ||
    !parsed.pathname.startsWith(ALLOWED_PATH_PREFIX)
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const upstream = await fetch(parsed.toString());
    if (!upstream.ok) {
      return NextResponse.json({ error: "upstream failed" }, { status: 502 });
    }

    const input = Buffer.from(await upstream.arrayBuffer());
    const output = await sharp(input)
      .rotate()
      .resize(40, 40, { fit: "cover" })
      .jpeg({ quality: 38, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "resize failed" }, { status: 500 });
  }
}
