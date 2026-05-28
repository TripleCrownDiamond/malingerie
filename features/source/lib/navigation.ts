const dedicatedMenuRoutes: Record<string, string> = {
  lingerie: "/lingerie",
  bdsm: "/bdsm",
  "bien-etre": "/bien-etre",
  aphrodisiaques: "/aphrodisiaques",
  "jeux-et-librairie": "/jeux-et-librairie",
  marques: "/marques",
  conseils: "/conseils",
};

export function resolveSourceMenuHref(slug: string, href: string) {
  return dedicatedMenuRoutes[slug] ?? href;
}
