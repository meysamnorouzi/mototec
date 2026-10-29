export function sectionSlug(pathname: string, prefix: string) {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    path = pathname;
  }
  path = path.replace(/\/+$/, "") || "/";
  const base = prefix.replace(/\/+$/, "") || "/";
  if (path === base) return null;
  const lead = `${base}/`;
  if (!path.startsWith(lead)) return null;
  const rest = path.slice(lead.length);
  if (!rest || rest.includes("/")) return null;
  return rest;
}
