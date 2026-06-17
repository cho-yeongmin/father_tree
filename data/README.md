# 보호수 CSV를 이 폴더에 넣으세요

## 1. 원본 파일 준비

1. [공공데이터포털 - 전국보호수 표준데이터](https://www.data.go.kr/data/15013194/fileData.do) 접속
2. **파일데이터 다운로드** (CSV)
3. 파일명을 `protected_trees.csv` 로 변경하여 이 폴더에 저장

## 2-A. Supabase 사이트에서 가져오기 (빠름, 추천)

```powershell
npm run export:protected-trees
```

생성 파일: **`data/trees_protected_for_supabase.csv`**

### Supabase에서 import

1. [Supabase 대시보드](https://supabase.com/dashboard) → 프로젝트 → **Table Editor** → `trees`
2. **Insert** → **Import data from CSV**
3. `trees_protected_for_supabase.csv` 선택
4. 컬럼이 자동 매칭되는지 확인 후 **Import**

> 이미 보호수를 넣었다면 중복 오류가 날 수 있습니다.  
> SQL Editor에서 `DELETE FROM trees WHERE source = 'localdata';` 실행 후 다시 import 하세요.

## 2-B. 터미널에서 임포트 (느림)

```powershell
npm run import:protected-trees
```

`.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 필요

## 원본 CSV 컬럼 예시

| 컬럼 | 용도 |
|------|------|
| `나무종류` | 나무 이름 (필수) |
| `나무나이` / `나무높이` / `가슴높이둘레` | 상세 설명 |
| `소재지도로명주소` | 주소·지역 |
| `WGS84위도` / `WGS84경도` | 위치 (필수) |

한글 윈도우 CSV(EUC-KR)도 자동 인식합니다.
