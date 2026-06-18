/** 지도 위 현재 위치 빨간 점 마커 */
export function createUserLocationDotElement(): HTMLDivElement {
  const dot = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  dot.style.width = "14px";
  dot.style.height = "14px";
  dot.style.borderRadius = "9999px";
  dot.style.backgroundColor = "#e53935";
  dot.style.border = "2px solid #ffffff";
  dot.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.25)";
  return dot;
}
