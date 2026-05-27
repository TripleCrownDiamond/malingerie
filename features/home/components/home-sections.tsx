"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { categories } from "@/features/catalog/data/categories";

export function HomeCategoryStrip() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            delay: index * 0.08,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Link
            href={`/catalogue?categorie=${category.slug}`}
            className="group block rounded-2xl border border-[var(--line)] bg-white/75 p-5 transition hover:border-[var(--accent)]"
          >
            <p className="font-display text-2xl text-[var(--ink)]">{category.name}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{category.description}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Voir la collection</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
