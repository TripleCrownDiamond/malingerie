import { FooterInfoPage } from "@/features/footer-pages/components/footer-info-page";
import { storyPage } from "@/features/footer-pages/data/footer-pages";

export default function Page() {
  return <FooterInfoPage {...storyPage} ctaHref="/catalogue" ctaLabel="Decouvrir la boutique" />;
}
