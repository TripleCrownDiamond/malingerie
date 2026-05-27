import { Container } from "@/components/ui/container";
import { WishlistPage } from "@/features/wishlist/components/wishlist-page";

export default function WishlistRoutePage() {
  return (
    <Container>
      <section className="space-y-6 py-12">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Wishlist</p>
        <h1 className="font-display text-5xl text-[var(--ink)]">Mes favoris</h1>
        <WishlistPage />
      </section>
    </Container>
  );
}