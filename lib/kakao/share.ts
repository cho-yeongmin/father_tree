const KAKAO_SDK_SCRIPT_ID = "kakao-js-sdk";

export function loadKakaoSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("브라우저 환경에서만 카카오 SDK를 불러올 수 있습니다."));
      return;
    }

    const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!appKey) {
      reject(new Error("NEXT_PUBLIC_KAKAO_APP_KEY가 설정되지 않았습니다."));
      return;
    }

    if (window.Kakao?.isInitialized()) {
      resolve();
      return;
    }

    const existing = document.getElementById(KAKAO_SDK_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(appKey);
        }
        resolve();
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_SDK_SCRIPT_ID;
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.async = true;
    script.onload = () => {
      window.Kakao.init(appKey);
      resolve();
    };
    script.onerror = () =>
      reject(new Error("카카오 SDK 로드에 실패했습니다."));
    document.head.appendChild(script);
  });
}

interface ShareTreeParams {
  treeId: string;
  name: string;
  description: string;
  imageUrl?: string | null;
}

export async function shareTreeOnKakao({
  treeId,
  name,
  description,
  imageUrl,
}: ShareTreeParams): Promise<void> {
  await loadKakaoSdk();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
  const shareUrl = `${appUrl}/trees/${treeId}`;

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: name,
      description: description.slice(0, 200),
      imageUrl:
        imageUrl ??
        `${appUrl}/markers/marker-star.svg`,
      link: {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      },
    },
    buttons: [
      {
        title: "나무 자세히 보기",
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
    ],
  });
}

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (settings: Record<string, unknown>) => void;
      };
    };
  }
}
