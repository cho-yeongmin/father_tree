export function extractCdata(xml: string, tag: string): string {
  const cdataRegex = new RegExp(
    `<${tag}>[\\s\\S]*?<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>[\\s\\S]*?<\\/${tag}>`,
  );
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch?.[1]) {
    return cdataMatch[1].trim();
  }

  const plainRegex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const plainMatch = xml.match(plainRegex);
  return plainMatch?.[1]?.trim() ?? "";
}

export function extractItems(xml: string): string[] {
  return xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
}
