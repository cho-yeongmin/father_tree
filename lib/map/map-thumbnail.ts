import { normalizeChaImageUrl } from "@/lib/cha/image-url";

const PLACEHOLDER_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23d4e0d4'/%3E%3Ctext x='20' y='27' text-anchor='middle' font-size='18' fill='%232d5a27'%3E%F0%9F%8C%B3%3C/text%3E%3C/svg%3E";

const clientCache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();
const queue: Array<() => void> = [];
let activeLoads = 0;
const MAX_CONCURRENT = 4;

export { PLACEHOLDER_THUMB };

export function getMapThumbnailApiUrl(originalUrl: string): string {
  return `/api/tree-thumb?url=${encodeURIComponent(originalUrl)}`;
}

function runQueue(): void {
  while (activeLoads < MAX_CONCURRENT && queue.length > 0) {
    const job = queue.shift();
    job?.();
  }
}

function enqueueLoad(task: () => Promise<void>): void {
  queue.push(() => {
    activeLoads += 1;
    void task().finally(() => {
      activeLoads -= 1;
      runQueue();
    });
  });
  runQueue();
}

/** 지도용 초소형 썸네일 (서버에서 40px JPEG로 축소) */
export function loadMapThumbnail(originalUrl: string): Promise<string> {
  const normalized = normalizeChaImageUrl(originalUrl);
  if (!normalized) {
    return Promise.resolve(PLACEHOLDER_THUMB);
  }

  const cached = clientCache.get(normalized);
  if (cached) {
    return Promise.resolve(cached);
  }

  const inflight = pending.get(normalized);
  if (inflight) {
    return inflight;
  }

  const apiUrl = getMapThumbnailApiUrl(normalized);
  const promise = new Promise<string>((resolve) => {
    enqueueLoad(async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("thumbnail fetch failed");
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        clientCache.set(normalized, objectUrl);
        resolve(objectUrl);
      } catch {
        resolve(PLACEHOLDER_THUMB);
      } finally {
        pending.delete(normalized);
      }
    });
  });

  pending.set(normalized, promise);
  return promise;
}

export function attachMapThumbnail(img: HTMLImageElement): void {
  const originalUrl = img.dataset.thumbUrl;
  if (!originalUrl || img.dataset.thumbReady === "true") {
    return;
  }

  if (img.dataset.thumbReady === "pending") {
    return;
  }

  img.dataset.thumbReady = "pending";
  void loadMapThumbnail(originalUrl).then((src) => {
    img.src = src;
    img.dataset.thumbReady = "true";
  });
}
