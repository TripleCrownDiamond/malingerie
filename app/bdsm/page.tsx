import { FooterCategoryPage } from "@/features/footer-pages/components/footer-category-page";
import { footerCategoryPages } from "@/features/footer-pages/data/footer-pages";

export default function Page() {
  return <FooterCategoryPage {...footerCategoryPages["bdsm"]} />;
}
