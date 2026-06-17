import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "세월을 품은 나무들",
    short_name: "나무들",
    description: "전국의 천연기념물과 보호수를 탐방하는 나무 여행 앱",
    start_url: "/auth/login",
    display: "standalone",
    background_color: "#f8faf6",
    theme_color: "#2d5a27",
    orientation: "portrait",
    lang: "ko",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
