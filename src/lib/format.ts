const numberFormat = new Intl.NumberFormat("fa-IR");

export function formatNumber(value: number) {
  return numberFormat.format(value);
}

export function toFaDigits(input: string) {
  return input.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}

export function normalizeSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[يی]/g, "ی")
    .replace(/[كک]/g, "ک")
    .replace(/‌/g, " ")
    .replace(/\s+/g, " ");
}

export function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
