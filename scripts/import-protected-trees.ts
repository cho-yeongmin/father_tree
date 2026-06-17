/**
 * 공공데이터포털 전국보호수 CSV → Supabase trees 임포트
 * CSV 다운로드: https://www.data.go.kr/data/15013194/fileData.do
 * 파일을 data/protected_trees.csv 로 저장 후 실행
 *
 * 사용법:
 *   npm run import:protected-trees
 */
import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { createAdminClient } from "./lib/supabase-admin";
import {
  parseProtectedTreesCsv,
  readProtectedTreesCsvContent,
  toProtectedTreeDbRow,
} from "./lib/parse-protected-trees-csv";
import { upsertTreeByExternalId } from "./lib/upsert-tree";

const CSV_PATH = resolve(process.cwd(), "data/protected_trees.csv");

async function main() {
  if (!existsSync(CSV_PATH)) {
    console.error(`CSV 파일이 없습니다: ${CSV_PATH}`);
    console.error(
      "공공데이터포털(https://www.data.go.kr/data/15013194)에서 보호수 CSV를 받아 위 경로에 저장하세요.",
    );
    process.exit(1);
  }

  const content = readProtectedTreesCsvContent(CSV_PATH);
  const rows = parseProtectedTreesCsv(content);

  console.log(`보호수 ${rows.length}건 임포트 시작...`);

  const supabase = createAdminClient();
  let imported = 0;
  let failed = 0;

  for (const row of rows) {
    const dbRow = toProtectedTreeDbRow(row);
    const { error } = await upsertTreeByExternalId(supabase, dbRow);

    if (error) {
      failed++;
      if (failed <= 5) {
        console.error(`실패: ${row.name} - ${error}`);
      }
    } else {
      imported++;
      if ((imported + failed) % 250 === 0) {
        process.stdout.write(
          `\r[${imported + failed}/${rows.length}] 임포트 중...`,
        );
      }
    }
  }

  process.stdout.write("\n");

  console.log(`완료: 성공 ${imported}건, 실패 ${failed}건`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
