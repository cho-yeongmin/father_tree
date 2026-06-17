/**
 * 국가유산청 Open API → Supabase trees 임포트
 * 참고: https://www.cha.go.kr/html/HtmlPage.do?pg=/publicinfo/pbinfo3_0202.jsp
 *
 * 사용법:
 *   npm run import:cha-trees
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import {
  fetchAllNaturalMonuments,
  fetchNaturalMonumentDetail,
  fetchNaturalMonumentImages,
  sleep,
} from "../lib/cha/client";
import { normalizeChaImageUrl } from "../lib/cha/image-url";
import { buildSummary, normalizeRegionName, splitLegend } from "../lib/cha/map-region";
import {
  hasValidCoordinates,
  isTreeNaturalMonument,
} from "../lib/cha/tree-filter";
import { createAdminClient } from "./lib/supabase-admin";
import { upsertTreeByExternalId } from "./lib/upsert-tree";

const BATCH_SIZE = 50;

async function main() {
  console.log("문화재청 천연기념물(나무) 데이터를 가져옵니다...");

  const allItems = await fetchAllNaturalMonuments();
  const treeItems = allItems.filter(
    (item) =>
      isTreeNaturalMonument(item.name) &&
      hasValidCoordinates(item.latitude, item.longitude),
  );

  console.log(`전체 ${allItems.length}건 중 나무 ${treeItems.length}건 임포트 대상`);

  const supabase = createAdminClient();

  // 기존 샘플 비활성화
  await supabase
    .from("trees")
    .update({ is_active: false })
    .is("external_id", null);

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < treeItems.length; i++) {
    const item = treeItems[i];
    process.stdout.write(`\r[${i + 1}/${treeItems.length}] ${item.name.slice(0, 20)}...`);

    try {
      await sleep(250);
      const detail = await fetchNaturalMonumentDetail(item);
      const images = await fetchNaturalMonumentImages(item);
      const region = normalizeRegionName(detail.region || item.region);
      const district = detail.district || item.district || null;
      const content = detail.content.trim();
      const legend = splitLegend(content);
      const imageGallery = images.map((image) => ({
        url: image.url,
        description: image.description || null,
      }));
      const mainImage =
        imageGallery[0]?.url ??
        normalizeChaImageUrl(detail.imageUrl) ??
        null;

      const row = {
        name: item.name,
        type: "natural_monument" as const,
        latitude: item.latitude,
        longitude: item.longitude,
        address: detail.address || null,
        region,
        district: district || null,
        designation_no: item.ccbaCpno,
        summary: buildSummary(item.name, content),
        description: content || null,
        legend,
        image_url: mainImage,
        image_gallery: imageGallery,
        stamp_radius_m: 50,
        is_active: true,
        source: "cha",
        external_id: `cha:${item.ccbaCpno}`,
      };

      const { error } = await upsertTreeByExternalId(supabase, row);

      if (error) {
        failed++;
        console.error(`\n실패: ${item.name} - ${error}`);
      } else {
        imported++;
      }
    } catch (error) {
      failed++;
      console.error(
        `\n실패: ${item.name} -`,
        error instanceof Error ? error.message : error,
      );
    }

    if ((i + 1) % BATCH_SIZE === 0) {
      await sleep(1000);
    }
  }

  console.log(`\n\n완료: 성공 ${imported}건, 실패 ${failed}건`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
