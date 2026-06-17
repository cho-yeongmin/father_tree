const PLACEHOLDER_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='8' fill='%23d4e0d4'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='20' fill='%232d5a27'%3E%F0%9F%8C%B3%3C/text%3E%3C/svg%3E";

const queue: Array<() => void> = [];
let activeLoads = 0;
const MAX_CONCURRENT = 6;

export { PLACEHOLDER_THUMB };

function runQueue(): void {
  while (activeLoads < MAX_CONCURRENT && queue.length > 0) {
    const job = queue.shift();
    job?.();
  }
}

function enqueueLoad(task: () => void): void {
  queue.push(() => {
    activeLoads += 1;
    task();
  });
  runQueue();
}

function finishLoad(): void {
  activeLoads -= 1;
  runQueue();
}

/** 화면에 보일 때만 원본 썸네일을 순서대로 로드합니다. */
export function attachLabelImage(img: HTMLImageElement): void {
  const url = img.dataset.thumbUrl;
  if (!url || img.dataset.thumbReady === "true") {
    return;
  }

  if (img.dataset.thumbReady === "pending") {
    return;
  }

  img.dataset.thumbReady = "pending";

  enqueueLoad(() => {
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";

    img.onload = () => {
      img.dataset.thumbReady = "true";
      finishLoad();
    };

    img.onerror = () => {
      img.src = PLACEHOLDER_THUMB;
      img.dataset.thumbReady = "true";
      finishLoad();
    };

    img.src = url;
  });
}
