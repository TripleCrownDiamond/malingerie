import { Container } from "@/components/ui/container";
import { CartPage } from "@/features/cart/components/cart-page";

export default function PanierPage() {
  return (
    <Container>
      <section className="space-y-6 py-12">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Panier & Checkout</p>
        <h1 className="font-display text-5xl text-[var(--ink)]">Finaliser votre commande</h1>
        <CartPage />
      </section>
    </Container>
  );
}