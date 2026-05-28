import { FooterInfoPage } from "@/features/footer-pages/components/footer-info-page";
import { assistancePages } from "@/features/footer-pages/data/footer-pages";

export default function Page() {
  return <FooterInfoPage {...assistancePages["paiement-securise"]} />;
}
