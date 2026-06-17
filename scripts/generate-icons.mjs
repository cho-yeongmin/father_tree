import { readFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const SVG_PATH = resolve(ROOT, "public/icons/icon.svg");
const OUT_DIR = resolve(ROOT, "public/icons");

const SIZES = [192, 512, 180];

async function main() {
  if (!existsSync(SVG_PATH)) {
    throw new Error(`아이콘 SVG가 없습니다: ${SVG_PATH}`);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const svg = readFileSync(SVG_PATH);

  for (const size of SIZES) {
    const filename =
      size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
    await sharp(svg).resize(size, size).png().toFile(resolve(OUT_DIR, filename));
    console.log(`생성: public/icons/${filename}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
