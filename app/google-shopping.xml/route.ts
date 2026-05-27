import { NextResponse } from "next/server";

import { readGoogleShoppingConfig, readSourceProducts } from "@/lib/server/config-store";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const config = await readGoogleShoppingConfig();

  if (!config.enabled) {
    return new NextResponse("Google Shopping feed disabled", { status: 503 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const products = await readSourceProducts();

  const itemsXml = products
    .filter((product) => Boolean(product.image))
    .map((product) => {
      const productUrl = `${siteUrl}/produit/${product.slug}`;
      const title = escapeXml(product.name);
      const description = escapeXml((product.longDescription || product.shortDescription || product.name).slice(0, 4990));
      const imageLink = escapeXml(product.image);
      const availability = product.stock > 0 ? "in_stock" : "out_of_stock";
      const price = `${product.price.toFixed(2)} ${config.currency}`;
      const compareAt = product.compareAtPrice && product.compareAtPrice > product.price ? `${product.compareAtPrice.toFixed(2)} ${config.currency}` : null;

      const galleryLinks = (product.gallery ?? [])
        .filter((image) => image && image !== product.image)
        .slice(0, 5)
        .map((image) => `<g:additional_image_link>${escapeXml(image)}</g:additional_image_link>`)
        .join("\n");

      return `
        <item>
          <g:id>${escapeXml(product.id)}</g:id>
          <title>${title}</title>
          <description>${description}</description>
          <link>${escapeXml(productUrl)}</link>
          <g:image_link>${imageLink}</g:image_link>
          ${galleryLinks}
          <g:condition>${config.condition}</g:condition>
          <g:availability>${availability}</g:availability>
          <g:price>${price}</g:price>
          ${compareAt ? `<g:sale_price>${compareAt}</g:sale_price>` : ""}
          <g:brand>${escapeXml(config.brand)}</g:brand>
          <g:google_product_category>${escapeXml(config.defaultGoogleProductCategory)}</g:google_product_category>
          <g:product_type>${escapeXml(product.categorySlug)}</g:product_type>
          <g:shipping>
            <g:country>${escapeXml(config.shipping.country)}</g:country>
            <g:service>${escapeXml(config.shipping.service)}</g:service>
            <g:price>${config.shipping.price.toFixed(2)} ${config.currency}</g:price>
          </g:shipping>
        </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Ma Petite Lingerie - Google Shopping Feed</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Flux produits Google Shopping</description>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}