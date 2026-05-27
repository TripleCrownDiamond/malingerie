export function resolveSourceMenuHref(slug: string, href: string) {
  if (slug === "marques") {
    return "/marques";
  }

  if (slug === "conseils") {
    return "/conseils";
  }

  return href;
}
